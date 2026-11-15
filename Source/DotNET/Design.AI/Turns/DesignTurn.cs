// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.AI.Agents;
using Cratis.AI.Conversations;
using Cratis.Scene.Design.AI.Prompts;
using Cratis.Scene.Design.AI.Tools;
using Cratis.Scene.Design.AI.Workbench;
using Cratis.Scene.Design.Session;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// Runs a design turn: a person's instruction, a selection and what the host knows go to a model that has tools to read the catalogue and the design and
/// to write screens, until it finishes.
/// </summary>
/// <remarks>
/// <para>
/// The model comes from <see cref="IAIChatClients.For(Cratis.AI.LanguageModels.LanguageModelPurpose)"/> for the purpose in <see cref="DesignAIOptions"/>, so
/// provider pools, concurrency, rate limits, usage and the identity and causation of the agent are Cratis.AI's: a turn adds nothing of its own. The client is
/// wrapped with Microsoft.Extensions.AI's function invocation, which runs the tools and calls the model again with what they answered.
/// </para>
/// <para>
/// A turn changes nothing by itself: what it did comes back as design session events for the host to append, one revision of each touched screen sharing
/// the turn's id. A turn that cannot reach a clean state - the model gives up, the writes keep being refused, the iterations run out - has no events.
/// </para>
/// </remarks>
/// <param name="clients">The chat clients of Cratis.AI.</param>
/// <param name="execution">Opens the scope the turn runs in as the agent of its purpose, so what it causes is attributed to the agent and carries why it was acting.</param>
/// <param name="options">The options.</param>
/// <param name="logger">The logger.</param>
public class DesignTurn(IAIChatClients clients, IAgentExecution execution, IOptions<DesignAIOptions> options, ILogger<DesignTurn> logger)
{
    /// <summary>
    /// Runs a turn.
    /// </summary>
    /// <param name="request">What the person asked for.</param>
    /// <param name="context">What the host knows.</param>
    /// <param name="progress">Where to report what the turn is doing; the host streams it to the canvas.</param>
    /// <param name="cancellationToken">A token to cancel the turn.</param>
    /// <returns>What the turn did.</returns>
    public async Task<DesignTurnResult> Run(DesignTurnRequest request, DesignHostContext context, IProgress<DesignTurnProgress>? progress = null, CancellationToken cancellationToken = default)
    {
        var settings = options.Value;
        var (workbench, problem) = DesignWorkbench.Open(request, context, settings.MaximumFailedWrites);
        if (workbench is null)
        {
            logger.CannotOpenTheDesign(request.TurnId, problem!);
            return DesignTurnResult.Failed(problem!);
        }

        progress?.Report(DesignTurnProgress.Status("Starting"));
        var toolbox = new DesignToolbox(workbench, progress);
        List<ChatMessage> messages = [new(ChatRole.System, SystemPrompt(request)), UserMessage(request, workbench)];

        ChatResponse response;
        try
        {
            using var scope = execution.As(settings.ScreenDesignPurpose, new Dictionary<string, string>
            {
                ["scene.design.turn"] = request.TurnId,
                ["scene.design.session"] = request.Session.Id,
            });
            response = await ToolLoop.Run(clients, settings.ScreenDesignPurpose, messages, toolbox.Tools(), settings.MaximumIterations, cancellationToken);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.TheModelFailed(request.TurnId, exception);
            return DesignTurnResult.Failed($"The design could not be made: {exception.Message}");
        }

        if (workbench.Abandoned)
        {
            logger.GaveUp(request.TurnId, workbench.LastProblem);
            return DesignTurnResult.Failed($"I could not reach a clean design after {settings.MaximumFailedWrites} attempts, so nothing was changed. {workbench.LastProblem}".Trim());
        }

        if (!workbench.Finished && ToolLoop.RanOut(response))
        {
            logger.RanOutOfIterations(request.TurnId, settings.MaximumIterations);
            return DesignTurnResult.Failed($"I could not finish within {settings.MaximumIterations} steps, so nothing was changed.");
        }

        var reply = workbench.Reply ?? response.Text;
        if (!workbench.Finished && !string.IsNullOrWhiteSpace(reply))
        {
            progress?.Report(DesignTurnProgress.Reply(reply));
        }

        return workbench.Assemble(reply);
    }

    static string SystemPrompt(DesignTurnRequest request)
    {
        var prompt = DesignPrompts.Load(DesignPrompts.ScreenDesign);
        return request.Images is { Count: > 0 } ? prompt + DesignPrompts.Load(DesignPrompts.ImageToScreen) : prompt;
    }

    static ChatMessage UserMessage(DesignTurnRequest request, DesignWorkbench workbench)
    {
        List<string> lines =
        [
            request.Instruction.Trim(),
            string.Empty,
            $"Designing: {(workbench.Mode == DesignMode.Templates ? "screen templates" : "screens")}.",
            workbench.Names.Count == 0 ? "The design has none yet." : $"In the design now: {string.Join(", ", workbench.Names)}.",
        ];
        if (workbench.Context.Catalogue.TemplateSet is { Count: > 0 } set)
        {
            lines.Add($"Only these templates may be used: {string.Join(", ", set)}.");
        }

        if (request.Selection is { } selection && (selection.Screen is not null || selection.Template is not null || selection.Element is not null))
        {
            lines.Add($"Selected: {string.Join(", ", new[] { selection.Screen is null ? null : $"screen {selection.Screen}", selection.Template is null ? null : $"template {selection.Template}", selection.Element is null ? null : $"element {selection.Element}" }.OfType<string>())}.");
        }

        if (!string.IsNullOrWhiteSpace(workbench.Notes))
        {
            lines.AddRange([string.Empty, "Notes about this design:", workbench.Notes]);
        }

        List<AIContent> contents = [new TextContent(string.Join('\n', lines))];
        foreach (var image in request.Images ?? [])
        {
            if (!string.IsNullOrWhiteSpace(image.Title))
            {
                contents.Add(new TextContent($"Image: {image.Title}"));
            }

            contents.Add(new DataContent(image.Data, image.MediaType));
        }

        return new ChatMessage(ChatRole.User, contents);
    }
}
