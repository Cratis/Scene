// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.ComponentModel;
using System.Text.Json;
using Cratis.AI.Agents;
using Cratis.AI.Conversations;
using Cratis.Scene.Design.AI.Prompts;
using Cratis.Scene.Design.AI.Turns;
using Cratis.Scene.Design.Operations;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// Establishes or revises a design system from the sources a host supplies, with conflict detection.
/// </summary>
/// <remarks>
/// <para>
/// The sources come through <see cref="IDesignSources"/>: files of the product, brand files, component library manifests and captures of the running app.
/// The model reads them with tools, and writes the draft whole as Screenplay; every write is checked by the Screenplay compiler and by Scene resolving the
/// draft, and the answer is the diagnostics, so the model repairs inside the loop. Values the sources use for what looks like the same purpose are
/// found by <see cref="ConflictDetector"/> - the model does not guess them - and come back with the result, with identities that do not change when they
/// are found again.
/// </para>
/// <para>
/// The model comes from <c language="csharp">IAIChatClients.For</c> for the design system purpose in <see cref="DesignAIOptions"/>. The turn changes
/// nothing: what it wrote is the draft in the result, for the host to put through its own review and activation.
/// </para>
/// </remarks>
/// <param name="clients">The chat clients of Cratis.AI.</param>
/// <param name="execution">Opens the scope the turn runs in as the agent of its purpose, so what it causes is attributed to the agent and carries why it was acting.</param>
/// <param name="sources">What the design system is established from.</param>
/// <param name="options">The options.</param>
/// <param name="logger">The logger.</param>
public class DesignSystemTurn(IAIChatClients clients, IAgentExecution execution, IDesignSources sources, IOptions<DesignAIOptions> options, ILogger<DesignSystemTurn> logger)
{
    /// <summary>
    /// The most of a source a model is shown at once.
    /// </summary>
    public const int MaximumSourceLength = 12000;

    /// <summary>
    /// Runs a turn.
    /// </summary>
    /// <param name="request">What the person asked for.</param>
    /// <param name="progress">Where to report what the turn is doing.</param>
    /// <param name="cancellationToken">A token to cancel the turn.</param>
    /// <returns>What the turn did.</returns>
    public async Task<DesignSystemResult> Run(DesignSystemRequest request, IProgress<DesignTurnProgress>? progress = null, CancellationToken cancellationToken = default)
    {
        var settings = options.Value;
        var gathered = await sources.Gather(new DesignSourcesRequest(request.Scope, request.Skipped), cancellationToken);
        var session = new Session(request, gathered, settings.MaximumFailedWrites, progress);
        List<ChatMessage> messages = [new(ChatRole.System, DesignPrompts.Load(DesignPrompts.DesignSystem)), session.UserMessage()];
        ChatResponse response;
        try
        {
            progress?.Report(DesignTurnProgress.Status("Starting"));
            using var scope = execution.As(settings.DesignSystemPurpose, new Dictionary<string, string> { ["scene.design.scope"] = request.Scope });
            response = await ToolLoop.Run(clients, settings.DesignSystemPurpose, messages, session.Tools(), settings.MaximumIterations, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.TheModelFailed(exception);
            return DesignSystemResult.Failed($"The design system could not be made: {exception.Message}");
        }

        if (session.Abandoned)
        {
            logger.GaveUp(session.LastProblem);
            return DesignSystemResult.Failed($"I could not reach a design system the compiler accepts after {settings.MaximumFailedWrites} attempts, so nothing was changed. {session.LastProblem}".Trim());
        }

        if (!session.Finished && ToolLoop.RanOut(response))
        {
            logger.RanOutOfIterations(settings.MaximumIterations);
            return DesignSystemResult.Failed($"I could not finish within {settings.MaximumIterations} steps, so nothing was changed.");
        }

        return session.Assemble(response.Text);
    }

    static string Json(object value) => JsonSerializer.Serialize(value, DesignJson.Options);

    sealed class Session(DesignSystemRequest request, DesignSourceSet gathered, int maximumFailedWrites, IProgress<DesignTurnProgress>? progress)
    {
        readonly IReadOnlyList<DesignSystemConflict> _conflicts = ConflictDetector.Detect(gathered.Sources);
        string? _draft;
        IReadOnlyList<DesignDiagnostic> _warnings = [];
        int _failedInARow;

        public bool Finished { get; private set; }

        public bool Abandoned { get; private set; }

        public string LastProblem { get; private set; } = string.Empty;

        string? Summary { get; set; }

        public IList<AITool> Tools() =>
        [
            AIFunctionFactory.Create(ReadDesignSystem, "readDesignSystem"),
            AIFunctionFactory.Create(ListSources, "listSources"),
            AIFunctionFactory.Create(ReadSource, "readSource"),
            AIFunctionFactory.Create(ListConflicts, "listConflicts"),
            AIFunctionFactory.Create(WriteDesignSystem, "writeDesignSystem"),
            AIFunctionFactory.Create(Finish, "finish"),
        ];

        public ChatMessage UserMessage()
        {
            var steps = request.Steps is { Count: > 0 } ? request.Steps : request.Current.Length == 0 ? DesignSystemPhases.EstablishingSteps(gathered.Sources.Any(source => source.Kind == DesignSourceKind.RunningApp)) : [DesignSystemPhases.Revise];
            List<string> lines = [request.Current.Length == 0 ? "Establish the design system of this product." : "Revise the design system of this product."];
            if (!string.IsNullOrWhiteSpace(request.Brief))
            {
                lines.AddRange([string.Empty, steps.Contains(DesignSystemPhases.Revise) ? "What the person asked for:" : "Notes about the brand from the team:", request.Brief]);
            }

            lines.AddRange([string.Empty, "Steps:", .. steps.Select(step => $"- {DesignSystemPhases.NameOf(step)}: {DesignSystemPhases.InstructionFor(step)}")]);
            lines.AddRange([string.Empty, gathered.Sources.Count == 0 ? "No sources were found." : $"Sources: {gathered.Sources.Count} - read them with listSources and readSource."]);
            if (_conflicts.Count > 0)
            {
                lines.Add($"The sources use {_conflicts.Count} values for what looks like the same purpose - read them with listConflicts.");
            }

            if (gathered.Missing.Count > 0)
            {
                lines.AddRange([string.Empty, "Not available - say in the summary what that leaves out:", .. gathered.Missing.Select(missing => $"- {missing}")]);
            }

            List<AIContent> contents = [new TextContent(string.Join('\n', lines))];
            foreach (var capture in gathered.Sources.Where(source => source.Image is { Length: > 0 }))
            {
                contents.Add(new TextContent($"Capture of the running app: {capture.Name}"));
                contents.Add(new DataContent(capture.Image!.Value, capture.MediaType));
            }

            return new ChatMessage(ChatRole.User, contents);
        }

        public DesignSystemResult Assemble(string reply)
        {
            var summary = Summary ?? reply;
            return new DesignSystemResult(true, summary, _draft, _conflicts, _warnings, gathered.Missing);
        }

        [Description("Reads the design system and its themes as they are now: the Screenplay of the draft. Empty when there is none yet.")]
        string ReadDesignSystem()
        {
            progress?.Report(DesignTurnProgress.Status("Reading the design system"));
            return Json(new { text = _draft ?? request.Current, exists = (_draft ?? request.Current).Length > 0 });
        }

        [Description("Lists the sources the design system is established from: kind, where each comes from, its name and its length. A capture of the running app is an image you were shown.")]
        string ListSources()
        {
            progress?.Report(DesignTurnProgress.Status("Looking at the sources"));
            return Json(new
            {
                sources = gathered.Sources.Select(source => new { kind = source.Kind.ToString(), origin = source.Origin, name = source.Name, length = source.Content.Length, image = source.Image is { Length: > 0 } }),
                missing = gathered.Missing
            });
        }

        [Description("Reads one source: its text, at most 12000 characters. A source is identified by its origin and its name.")]
        string ReadSource([Description("The name of the source, as listSources gives it.")] string name, [Description("The origin, when two sources share a name.")] string? origin = null)
        {
            progress?.Report(DesignTurnProgress.Status($"Reading {name}"));
            var source = gathered.Sources.FirstOrDefault(candidate => candidate.Name == name && (origin is null || candidate.Origin == origin));
            if (source is null)
            {
                return Json(new { found = false, message = $"There is no source named '{name}'. Ask listSources." });
            }

            var content = source.Content.Length > MaximumSourceLength ? source.Content[..MaximumSourceLength] : source.Content;
            return Json(new { found = true, kind = source.Kind.ToString(), origin = source.Origin, name = source.Name, truncated = source.Content.Length > MaximumSourceLength, text = content });
        }

        [Description("Lists the values the sources use for what looks like the same purpose - two nearly identical colors, corner radii a pixel or two apart - with how often and where each is used. They are for a person to decide: keep one in the draft and name the other in the summary.")]
        string ListConflicts()
        {
            progress?.Report(DesignTurnProgress.Status("Looking for conflicts in the sources"));
            return Json(new { conflicts = _conflicts });
        }

        [Description("Writes the whole design system as Screenplay: a `design system` with its token roles, components, words and rules, and the `theme`s that implement it with a value for every token in every mode. It is checked by the Screenplay compiler and by resolving it; the answer says what is wrong, and when anything is an error nothing was changed.")]
        string WriteDesignSystem([Description("The Screenplay text of the design system and its themes.")] string text)
        {
            progress?.Report(DesignTurnProgress.Status("Writing the design system"));
            var diagnostics = DesignSystemCheck.Check(text);
            if (diagnostics.Any(diagnostic => diagnostic.Severity == "error"))
            {
                _failedInARow++;
                LastProblem = string.Join(' ', diagnostics.Where(diagnostic => diagnostic.Severity == "error").Select(diagnostic => diagnostic.Message));
                if (_failedInARow >= maximumFailedWrites)
                {
                    Abandoned = true;
                    ToolLoop.End();
                }

                return Json(new { applied = false, summary = "Nothing was changed.", diagnostics });
            }

            _failedInARow = 0;
            _draft = text;
            _warnings = [.. diagnostics];
            return Json(new { applied = true, summary = "The design system is written.", diagnostics });
        }

        [Description("Ends the turn. Call it when the draft is what the sources and the request support.")]
        string Finish(
            [Description("What you changed, in plain sentences.")] string summary,
            [Description("The conflicts and gaps a person has to decide: what the sources disagree on or say nothing about.")] string? gaps = null)
        {
            Summary = string.IsNullOrWhiteSpace(gaps) ? summary : $"{summary}\n\n{gaps}";
            Finished = true;
            progress?.Report(DesignTurnProgress.Reply(Summary));
            ToolLoop.End();
            return Json(new { finished = true });
        }
    }
}
