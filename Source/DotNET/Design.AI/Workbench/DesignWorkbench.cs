// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.AI.Turns;
using Cratis.Scene.Design.Operations;
using Cratis.Scene.Design.ScreenSets;
using Cratis.Scene.Design.Session;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.AI.Workbench;

/// <summary>
/// The design a turn works on. Every write the model makes runs against a scratch copy of it - compiled by Screenplay's compiler, converted to
/// Scene, checked against the catalogue - and only a write that comes out clean is kept; what the model gets back is the diagnostics, so that it repairs
/// inside the loop. A turn that cannot reach a clean state changes nothing.
/// </summary>
internal sealed class DesignWorkbench
{
    readonly DesignTurnRequest _request;
    readonly DesignHostContext _host;
    readonly ScreenplayBridge _bridge;
    readonly IReadOnlySet<string> _applicationShapes;
    readonly OrderedDictionary<string, string> _texts = [];
    readonly Dictionary<string, string> _original = new(StringComparer.Ordinal);
    readonly Dictionary<string, List<DesignOperation>> _operations = new(StringComparer.Ordinal);
    readonly List<(string Group, string Screen, IReadOnlyList<ProposedVariation> Candidates)> _variations = [];
    readonly List<ProposedTweak> _tweaks = [];
    readonly List<DesignSystemProposal> _proposals = [];
    readonly List<DesignTurnRefusal> _refusals = [];
    readonly List<DesignTurnRefusal> _checkRefusals = [];
    readonly int _maximumFailedWrites;
    DesignWorkspace _workspace;
    bool _reordered;
    int _failedInARow;

    DesignWorkbench(DesignTurnRequest request, DesignHostContext host, DesignContext context, ScreenplayBridge bridge, DesignWorkspace workspace, int maximumFailedWrites)
    {
        _request = request;
        _host = host;
        Context = context;
        _bridge = bridge;
        _workspace = workspace;
        _maximumFailedWrites = maximumFailedWrites;
        _applicationShapes = ScreenplayBridge.DeclaredShapes(host.Screenplay);
        foreach (var entry in request.Session.Screens)
        {
            var text = request.Session.CurrentRevisionOf(entry.Screen)?.Text ?? string.Empty;
            _texts[entry.Screen] = text;
            _original[entry.Screen] = text;
        }
    }

    /// <summary>
    /// Gets the design session the turn is for.
    /// </summary>
    public DesignSession Session => _request.Session;

    /// <summary>
    /// Gets whether the turn designs screens or screen templates.
    /// </summary>
    public DesignMode Mode => _request.Session.Mode;

    /// <summary>
    /// Gets the context the design operations are checked in.
    /// </summary>
    public DesignContext Context { get; }

    /// <summary>
    /// Gets the design as it is now.
    /// </summary>
    public DesignWorkspace Workspace => _workspace;

    /// <summary>
    /// Gets what the host told the model about the design.
    /// </summary>
    public string? Notes => _host.Notes;

    /// <summary>
    /// Gets the names of the screens, or screen templates, of the design, in order.
    /// </summary>
    public IReadOnlyList<string> Names => [.. _texts.Keys];

    /// <summary>
    /// Gets what the model said to the person when it finished.
    /// </summary>
    public string? Reply { get; private set; }

    /// <summary>
    /// Gets whether the model finished.
    /// </summary>
    public bool Finished { get; private set; }

    /// <summary>
    /// Gets whether the turn was given up after too many refused writes in a row.
    /// </summary>
    public bool Abandoned { get; private set; }

    /// <summary>
    /// Gets why the last write was refused.
    /// </summary>
    public string LastProblem { get; private set; } = string.Empty;

    /// <summary>
    /// Opens the design of a turn: the screens of the session compiled with the application's Screenplay.
    /// </summary>
    /// <param name="request">What the turn is for.</param>
    /// <param name="host">What the host knows.</param>
    /// <param name="maximumFailedWrites">The most writes that may be refused in a row.</param>
    /// <returns>The workbench, or why the design cannot be opened.</returns>
    public static (DesignWorkbench? Workbench, string? Problem) Open(DesignTurnRequest request, DesignHostContext host, int maximumFailedWrites)
    {
        var input = host.Catalogue with { TemplateSet = request.TemplateSet ?? request.Session.TemplateSet ?? host.Catalogue.TemplateSet };
        var context = DesignContext.Create(input);
        var bridge = new ScreenplayBridge(host.Screenplay);
        var texts = request.Session.Screens.Select(entry => request.Session.CurrentRevisionOf(entry.Screen)?.Text ?? string.Empty).ToList();
        var built = bridge.ToDocument(texts, request.Session.Mode);
        if (!built.Succeeded)
        {
            var errors = built.Diagnostics.Where(diagnostic => diagnostic.Severity == "error").Select(diagnostic => diagnostic.Message);
            return (null, $"The design does not compile with the application's Screenplay: {string.Join(' ', errors)}");
        }

        var set = ScreenSet.Create(request.Session.Screens.Select(entry => entry.Screen));
        foreach (var storyline in host.Storylines ?? [])
        {
            set = set.WithStoryline(storyline);
        }

        var workspace = new DesignWorkspace(built.Document!, set, input.Profile);
        return (new DesignWorkbench(request, host, context, bridge, workspace, maximumFailedWrites), null);
    }

    /// <summary>
    /// Gets the text of a screen, or a screen template, as the design has it now.
    /// </summary>
    /// <param name="name">The name.</param>
    /// <returns>The Screenplay text; <see langword="null"/> when there is no such screen.</returns>
    public string? TextOf(string name) => _texts.TryGetValue(name, out var text) ? text : null;

    /// <summary>
    /// Gets the elements of a screen, or a screen template: what an operation can address.
    /// </summary>
    /// <param name="name">The name.</param>
    /// <returns>The elements, outermost first; <see langword="null"/> when there is no such screen.</returns>
    public IReadOnlyList<ElementOutline>? ElementsOf(string name)
    {
        var target = DocumentLookup.ResolveTarget(_workspace.Document, Mode == DesignMode.Templates ? null : name, Mode == DesignMode.Templates ? name : null);
        if (target is null)
        {
            return null;
        }

        List<ElementOutline> outline = [];
        foreach (var (outlet, elements) in DocumentLookup.ContentOf(target))
        {
            foreach (var element in (elements as JsonArray)?.OfType<JsonObject>() ?? [])
            {
                Outline(element, outlet, string.Empty, outline);
            }
        }

        return outline;
    }

    /// <summary>
    /// Gets the comments of the design, by the element they are on.
    /// </summary>
    /// <param name="screen">The screen they are on, when asked for one screen.</param>
    /// <param name="element">The element they are on, when asked for one element.</param>
    /// <returns>The comments.</returns>
    public IReadOnlyList<DesignComment> CommentsOn(string? screen, string? element) =>
        [.. _request.Session.Comments.Where(comment => (screen is null || comment.Screen == screen) && (element is null || comment.ElementId == element))];

    /// <summary>
    /// Gets the storylines of the design: the default one, which follows the screens, and the host's.
    /// </summary>
    /// <returns>The storylines.</returns>
    public IReadOnlyList<Storyline> Storylines() => _workspace.ScreenSet.Storylines;

    /// <summary>
    /// Writes a whole screen, or screen template, as Screenplay: the way a screen is created. The screen replaces the one of that name, if the design has it.
    /// </summary>
    /// <param name="text">The Screenplay text of one screen.</param>
    /// <returns>What came of it; nothing changes unless it was clean.</returns>
    public WriteOutcome WriteScreen(string text)
    {
        var names = ScreenplayBridge.Declared(text, Mode);
        if (names.Count != 1)
        {
            var what = Mode == DesignMode.Templates ? "screen template" : "screen";
            return Refused([new DesignDiagnostic("textNeedsOneScreen", "error", $"The text must declare exactly one {what}; it declares {names.Count}.")]);
        }

        var name = names[0];
        var next = Replaced(name, text);
        var built = _bridge.ToDocument([.. next.Values], Mode);
        if (!built.Succeeded)
        {
            return Refused(built.Diagnostics);
        }

        var problems = Check(built.Document!, name);
        if (problems.Any(problem => problem.Severity == "error"))
        {
            return Refused([.. built.Diagnostics, .. problems]);
        }

        var (kept, document) = Canonical(next, name, text, built.Document!);
        next[name] = kept;
        var set = _workspace.ScreenSet.AddScreen(name);
        _workspace = _workspace with { Document = document, ScreenSet = set };
        Replace(next);
        Touch(name, null);
        Succeeded();
        return new WriteOutcome(true, $"Wrote {name}.", [.. built.Diagnostics, .. problems], [name]);
    }

    /// <summary>
    /// Applies design operations. They are applied together or not at all: when any of them is refused, nothing changes, and the outcome of each says why.
    /// </summary>
    /// <param name="operations">The operations.</param>
    /// <returns>What came of it.</returns>
    public WriteOutcome ApplyOperations(IReadOnlyList<DesignOperation> operations)
    {
        var refusals = operations.OfType<RefuseOperation>().ToList();
        var actual = operations.Where(operation => operation is not RefuseOperation).ToList();
        if (actual.Count == 0 && refusals.Count > 0)
        {
            foreach (var refusal in refusals)
            {
                _refusals.Add(new DesignTurnRefusal(refusal.Code.Length == 0 ? DesignRefusalCode.FreeStylingNotAllowed : refusal.Code, refusal.Reason, refusal.Alternatives ?? []));
            }

            Succeeded();
            return new WriteOutcome(true, "The refusal is recorded.", [], []);
        }

        var result = DesignOperations.Apply(_workspace, actual, Context);
        var refused = result.Outcomes.Where(outcome => !outcome.Applied).ToList();
        if (refused.Count > 0)
        {
            foreach (var outcome in refused)
            {
                _checkRefusals.Add(new DesignTurnRefusal(outcome.Code ?? DesignRefusalCode.EditUnknown, outcome.Reason ?? string.Empty, outcome.Alternatives ?? []));
            }

            return Refused([.. refused.SelectMany(outcome => outcome.Diagnostics)], result.Outcomes);
        }

        var committed = Commit(result, actual, out var diagnostics, out var touched);
        if (!committed)
        {
            return Refused(diagnostics, result.Outcomes);
        }

        foreach (var refusal in refusals)
        {
            _refusals.Add(new DesignTurnRefusal(refusal.Code.Length == 0 ? DesignRefusalCode.FreeStylingNotAllowed : refusal.Code, refusal.Reason, refusal.Alternatives ?? []));
        }

        foreach (var outcome in result.Outcomes)
        {
            Collect(outcome);
        }

        Succeeded();
        return new WriteOutcome(true, string.Join(' ', result.Outcomes.Select(outcome => outcome.Summary).Where(summary => !string.IsNullOrEmpty(summary))), [.. diagnostics, .. result.Outcomes.SelectMany(outcome => outcome.Diagnostics)], touched, result.Outcomes);
    }

    /// <summary>
    /// Offers variations of a screen: the same screen on other templates, or whole screens the model wrote.
    /// </summary>
    /// <param name="screen">The screen.</param>
    /// <param name="templates">The templates to lay it out on; at most <see cref="DesignLimits.MaximumVariations"/>.</param>
    /// <param name="candidates">Candidates written as Screenplay, each declaring the screen.</param>
    /// <returns>What came of it.</returns>
    public WriteOutcome ProposeVariations(string screen, IReadOnlyList<string>? templates, IReadOnlyList<string>? candidates)
    {
        if (!_texts.ContainsKey(screen))
        {
            return Refused([new DesignDiagnostic(DesignRefusalCode.ScreenUnknown, "error", DesignMessages.ScreenUnknown(screen), screen)]);
        }

        List<ProposedVariation> proposed = [];
        List<DesignDiagnostic> diagnostics = [];
        var group = $"{_request.TurnId}/variations/{_variations.Count + 1}";
        if (templates is { Count: > 0 })
        {
            var outcome = DesignOperations.Apply(_workspace, [new VariationsOperation(screen, templates)], Context).Outcomes[0];
            if (!outcome.Applied)
            {
                _checkRefusals.Add(new DesignTurnRefusal(outcome.Code ?? DesignRefusalCode.EditUnknown, outcome.Reason ?? string.Empty, outcome.Alternatives ?? []));
                return Refused(outcome.Diagnostics, [outcome]);
            }

            foreach (var candidate in outcome.Variations ?? [])
            {
                var document = _workspace.Document with { Screens = [candidate.Screen] };
                var name = JsonNode.Parse(candidate.Screen.GetRawText())?["name"]?.GetValue<string>() ?? screen;
                var text = _bridge.ToText(document, name, Mode, Elsewhere(screen));
                if (text is null)
                {
                    diagnostics.Add(new DesignDiagnostic("variationNotScreenplay", "error", $"Variation {candidate.Letter} cannot be written as Screenplay.", screen));
                    continue;
                }

                proposed.Add(new ProposedVariation($"{group}/{candidate.Letter}", text));
            }
        }

        var own = candidates ?? [];
        for (var index = 0; index < own.Count; index++)
        {
            var written = Candidate(screen, own[index], $"{group}/{(char)('A' + proposed.Count)}", diagnostics);
            if (written is not null)
            {
                proposed.Add(written);
            }
        }

        if (proposed.Count > DesignLimits.MaximumVariations)
        {
            return Refused([new DesignDiagnostic(DesignRefusalCode.TooManyTemplates, "error", DesignMessages.TooManyTemplates(DesignLimits.MaximumVariations), screen)]);
        }

        if (proposed.Count == 0 || diagnostics.Exists(diagnostic => diagnostic.Severity == "error"))
        {
            return Refused(diagnostics.Count > 0 ? diagnostics : [new DesignDiagnostic("noVariations", "error", "Give templates to lay the screen out on, or candidates written as Screenplay.", screen)]);
        }

        _variations.Add((group, screen, proposed));
        Succeeded();
        return new WriteOutcome(true, DesignMessages.VariationsOffered(proposed.Count, screen), diagnostics, []);
    }

    /// <summary>
    /// Offers tweak controls: what can be adjusted without asking the model again.
    /// </summary>
    /// <param name="controls">The controls; at most <see cref="DesignLimits.MaximumTweaks"/>.</param>
    /// <returns>What came of it.</returns>
    public WriteOutcome ProposeTweaks(IReadOnlyList<TweakControl> controls)
    {
        var outcome = DesignOperations.Apply(_workspace, [new TweaksOperation(controls)], Context).Outcomes[0];
        if (!outcome.Applied)
        {
            _checkRefusals.Add(new DesignTurnRefusal(outcome.Code ?? DesignRefusalCode.EditUnknown, outcome.Reason ?? string.Empty, outcome.Alternatives ?? []));
            return Refused(outcome.Diagnostics, [outcome]);
        }

        Collect(outcome);
        Succeeded();
        return new WriteOutcome(true, outcome.Summary ?? string.Empty, [], []);
    }

    /// <summary>
    /// Proposes what the design system lacks: a token, a variant, a word. It goes to the draft of the design system, which follows its own review and activation.
    /// </summary>
    /// <param name="proposal">The proposal.</param>
    /// <returns>What came of it.</returns>
    public WriteOutcome ProposeDesignSystemChange(DesignSystemProposal proposal)
    {
        if (!DesignSystemProposalKinds.All.Contains(proposal.Kind))
        {
            return Refused([new DesignDiagnostic("proposalKindUnknown", "error", $"A proposal is one of {string.Join(", ", DesignSystemProposalKinds.All)}; '{proposal.Kind}' is not.")]);
        }

        if (string.IsNullOrWhiteSpace(proposal.Summary))
        {
            return Refused([new DesignDiagnostic("proposalNeedsSummary", "error", "A proposal says in a sentence what it adds and why.")]);
        }

        if (proposal.Kind == DesignSystemProposalKinds.Variant && (proposal.Component is null || proposal.Variant is null))
        {
            return Refused([new DesignDiagnostic("proposalNeedsVariant", "error", "A variant proposal names the component and the variant.")]);
        }

        if ((proposal.Kind == DesignSystemProposalKinds.Token || proposal.Kind == DesignSystemProposalKinds.Word) && proposal.Address is null)
        {
            return Refused([new DesignDiagnostic("proposalNeedsAddress", "error", "A token or word proposal names the address it is for, such as tokens.color.accent or words.voice.tone.")]);
        }

        _proposals.Add(proposal);
        Succeeded();
        return new WriteOutcome(true, "Proposed to the design system draft.", [], []);
    }

    /// <summary>
    /// Refuses a write that could not even be read.
    /// </summary>
    /// <param name="message">Why.</param>
    /// <returns>The outcome; nothing changed.</returns>
    public WriteOutcome Rejected(string message) => Refused([new DesignDiagnostic("unreadable", "error", message)]);

    /// <summary>
    /// Finishes the turn.
    /// </summary>
    /// <param name="reply">What to say to the person.</param>
    public void Finish(string reply)
    {
        Reply = reply;
        Finished = true;
    }

    /// <summary>
    /// Assembles what the turn did. A turn that did not reach a clean state has nothing to append.
    /// </summary>
    /// <param name="reply">What to say to the person when the model did not give a reply of its own.</param>
    /// <returns>The result.</returns>
    public DesignTurnResult Assemble(string reply)
    {
        List<object> events = [];
        List<string> touched = [];
        var prompt = _request.Instruction;
        foreach (var (name, text) in _texts)
        {
            if (_original.TryGetValue(name, out var before) && before == text)
            {
                continue;
            }

            var basis = _request.Session.CurrentRevisionOf(name)?.Id ?? string.Empty;
            events.Add(new ScreenRevisionRecorded(
                $"{_request.TurnId}/{name}",
                name,
                text,
                _operations.GetValueOrDefault(name) ?? [],
                _request.Author,
                prompt,
                _request.TurnId,
                _host.DesignSystemVersion,
                basis));
            touched.Add(name);
        }

        events.AddRange(_original.Keys.Where(name => !_texts.ContainsKey(name)).Select(name => (object)new ScreenRemovedFromDesign(name)));
        if (_reordered)
        {
            events.Add(new ScreensReordered([.. _workspace.ScreenSet.Screens]));
        }

        foreach (var (group, screen, candidates) in _variations)
        {
            events.Add(new VariationsProposed(group, screen, candidates, prompt));
        }

        if (_tweaks.Count > 0)
        {
            var screen = _tweaks.Select(tweak => tweak.Address.Screen ?? tweak.Address.Template).FirstOrDefault(name => !string.IsNullOrEmpty(name)) ?? _request.Selection?.Screen ?? string.Empty;
            events.Add(new TweaksProposed([.. _tweaks], screen));
        }

        var refusals = _refusals.Count > 0 || touched.Count > 0 || _variations.Count > 0 || _tweaks.Count > 0 || _proposals.Count > 0
            ? _refusals
            : _checkRefusals;
        var profile = !ReferenceEquals(_workspace.Profile, _host.Catalogue.Profile) ? _workspace.Profile : null;
        return new DesignTurnResult(true, reply, events, [.. refusals], [.. _proposals], touched) { Profile = profile };
    }

    static void Outline(JsonObject element, string outlet, string parent, List<ElementOutline> outline)
    {
        var id = DocumentLookup.Text(element, "id") ?? string.Empty;
        var properties = (JsonObject?)(element["properties"] as JsonObject)?.DeepClone() ?? [];
        outline.Add(new ElementOutline(id, DocumentLookup.ComponentNameOf(element), outlet, parent.Length > 0 ? parent : null, properties));
        foreach (var (slot, children) in element["slots"] as JsonObject ?? [])
        {
            foreach (var child in (children as JsonArray)?.OfType<JsonObject>() ?? [])
            {
                Outline(child, outlet, id.Length > 0 ? $"{id}.{slot}" : slot, outline);
            }
        }
    }

    static bool SameElement(IReadOnlyList<JsonElement> first, IReadOnlyList<JsonElement> second, string name)
    {
        var left = first.Select(element => JsonNode.Parse(element.GetRawText())).FirstOrDefault(node => node?["name"]?.GetValue<string>() == name);
        var right = second.Select(element => JsonNode.Parse(element.GetRawText())).FirstOrDefault(node => node?["name"]?.GetValue<string>() == name);
        return left is not null && right is not null && JsonNode.DeepEquals(left, right);
    }

    ProposedVariation? Candidate(string screen, string text, string id, List<DesignDiagnostic> diagnostics)
    {
        var names = ScreenplayBridge.Declared(text, Mode);
        if (names.Count != 1 || names[0] != screen)
        {
            diagnostics.Add(new DesignDiagnostic("candidateNeedsTheScreen", "error", $"A candidate declares exactly the screen '{screen}'.", screen));
            return null;
        }

        var next = Replaced(screen, text);
        var built = _bridge.ToDocument([.. next.Values], Mode);
        if (!built.Succeeded)
        {
            diagnostics.AddRange(built.Diagnostics);
            return null;
        }

        var problems = Check(built.Document!, screen);
        if (problems.Any(problem => problem.Severity == "error"))
        {
            diagnostics.AddRange(problems);
            return null;
        }

        var (kept, _) = Canonical(next, screen, text, built.Document!);
        return new ProposedVariation(id, kept);
    }

    OrderedDictionary<string, string> Replaced(string name, string text)
    {
        var next = new OrderedDictionary<string, string>(_texts);
        next[name] = text;
        return next;
    }

    void Replace(OrderedDictionary<string, string> next)
    {
        _texts.Clear();
        foreach (var (name, text) in next)
        {
            _texts[name] = text;
        }
    }

    IReadOnlyList<DesignDiagnostic> Check(SceneDocument document, string name) =>
        ScreenConformance.Check(_workspace with { Document = document }, Context, name, Mode == DesignMode.Templates);

    HashSet<string> Elsewhere(string name)
    {
        var shapes = new HashSet<string>(_applicationShapes, StringComparer.Ordinal);
        foreach (var (other, text) in _texts)
        {
            if (other != name)
            {
                shapes.UnionWith(ScreenplayBridge.DeclaredShapes(text));
            }
        }

        return shapes;
    }

    /// <summary>
    /// What the text of a screen is once the design says it: the screen printed from its Scene document, when printing and reading it back
    /// gives the same document; otherwise the text the model wrote.
    /// </summary>
    /// <param name="texts">The texts of the design with the text the model wrote in place.</param>
    /// <param name="name">The screen.</param>
    /// <param name="written">The text the model wrote.</param>
    /// <param name="document">The document the text compiled to.</param>
    /// <returns>The text to keep, and the document it compiles to.</returns>
    (string Text, SceneDocument Document) Canonical(OrderedDictionary<string, string> texts, string name, string written, SceneDocument document)
    {
        var printed = _bridge.ToText(document, name, Mode, Elsewhere(name));
        if (printed is null || printed == written)
        {
            return (written, document);
        }

        var next = new OrderedDictionary<string, string>(texts) { [name] = printed };
        var again = _bridge.ToDocument([.. next.Values], Mode);
        if (!again.Succeeded || !SameScreen(document, again.Document!, name))
        {
            return (written, document);
        }

        return (printed, again.Document!);
    }

    bool SameScreen(SceneDocument first, SceneDocument second, string name) =>
        Mode == DesignMode.Templates
            ? SameElement(first.ScreenTemplates, second.ScreenTemplates, name)
            : SameElement(first.Screens, second.Screens, name);

    bool Commit(DesignApplyResult result, IReadOnlyList<DesignOperation> operations, out List<DesignDiagnostic> diagnostics, out List<string> touched)
    {
        diagnostics = [];
        touched = [];
        var document = result.Workspace.Document;
        var removed = operations.OfType<RemoveScreenOperation>().Select(operation => operation.Name).ToHashSet(StringComparer.Ordinal);
        var next = new OrderedDictionary<string, string>(_texts);
        foreach (var name in removed)
        {
            next.Remove(name);
        }

        var names = operations.Select(Subject).Where(name => name is not null).Select(name => name!).Distinct(StringComparer.Ordinal).Where(name => !removed.Contains(name)).ToList();
        foreach (var name in names)
        {
            var text = _bridge.ToText(document, name, Mode, Elsewhere(name));
            if (text is null)
            {
                diagnostics.Add(new DesignDiagnostic("notScreenplay", "error", $"'{name}' would hold something Screenplay cannot say, so the operations are not applied.", name));
                return false;
            }

            next[name] = text;
        }

        var built = _bridge.ToDocument([.. next.Values], Mode);
        if (!built.Succeeded)
        {
            diagnostics.AddRange(built.Diagnostics);
            return false;
        }

        var problems = names.SelectMany(name => Check(built.Document!, name)).Where(problem => problem.Severity == "error").ToList();
        if (problems.Count > 0)
        {
            diagnostics.AddRange(problems);
            return false;
        }

        _workspace = result.Workspace with { Document = built.Document! };
        _reordered |= operations.Any(operation => operation is MoveScreenOperation);
        Replace(next);
        foreach (var operation in operations)
        {
            if (Subject(operation) is { } name && !removed.Contains(name))
            {
                Touch(name, operation);
            }
        }

        touched = [.. names];
        return true;
    }

    void Collect(DesignOutcome outcome)
    {
        foreach (var control in outcome.Controls ?? [])
        {
            var resolved = DesignTweaks.Resolve(control, _workspace, Context);
            _tweaks.Add(new ProposedTweak($"{_request.TurnId}/tweak/{_tweaks.Count + 1}", control.Label, control.Kind, control.Address, resolved?.Options is { Count: > 0 } options ? options : control.Options));
        }

        if (outcome.Variations is { Count: > 0 } && outcome.Operation is VariationsOperation variations)
        {
            var proposed = new List<ProposedVariation>();
            var group = $"{_request.TurnId}/variations/{_variations.Count + 1}";
            foreach (var candidate in outcome.Variations)
            {
                var name = JsonNode.Parse(candidate.Screen.GetRawText())?["name"]?.GetValue<string>() ?? variations.Screen;
                var text = _bridge.ToText(_workspace.Document with { Screens = [candidate.Screen] }, name, Mode, Elsewhere(variations.Screen));
                if (text is not null)
                {
                    proposed.Add(new ProposedVariation($"{group}/{candidate.Letter}", text));
                }
            }

            if (proposed.Count > 0)
            {
                _variations.Add((group, variations.Screen, proposed));
            }
        }

        _proposals.AddRange(outcome.Proposals ?? []);
    }

    void Touch(string name, DesignOperation? operation)
    {
        if (!_operations.TryGetValue(name, out var list))
        {
            _operations[name] = list = [];
        }

        if (operation is not null)
        {
            list.Add(operation);
        }
    }

    WriteOutcome Refused(IReadOnlyList<DesignDiagnostic> diagnostics, IReadOnlyList<DesignOutcome>? outcomes = null)
    {
        _failedInARow++;
        LastProblem = string.Join(' ', diagnostics.Where(diagnostic => diagnostic.Severity == "error").Select(diagnostic => diagnostic.Message));
        if (_failedInARow >= _maximumFailedWrites)
        {
            Abandoned = true;
        }

        return new WriteOutcome(false, "Nothing was changed.", diagnostics, [], outcomes);
    }

    void Succeeded() => _failedInARow = 0;

    string? Subject(DesignOperation operation) => operation switch
    {
        AddScreenOperation add => add.Name,
        RemoveScreenOperation remove => remove.Name,
        MoveScreenOperation move => move.Name,
        AddTemplateOperation template => template.Name,
        AddSlotOperation slot => slot.Template,
        RemoveSlotOperation slot => slot.Template,
        ArrangeOperation arrange => arrange.Template,
        ProfileOperation => null,
        _ => Mode == DesignMode.Templates ? operation.TargetTemplate() : operation.TargetScreen()
    };
}
