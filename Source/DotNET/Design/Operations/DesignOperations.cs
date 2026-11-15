// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Design.ScreenSets;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Checks, lowers and applies design operations. The TypeScript twin is <c language="text">applyDesignOperations</c>.
/// </summary>
public static class DesignOperations
{
    /// <summary>
    /// Checks an operation against the catalogue and the design as it is. A refused operation says why and offers the nearest ones that would be
    /// accepted: free styling, a value of its own, a template outside the allowed set, a component an outlet does not take.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <param name="workspace">The design.</param>
    /// <param name="context">The context.</param>
    /// <returns>Whether it is accepted, and why not.</returns>
    public static DesignValidation Validate(DesignOperation operation, DesignWorkspace workspace, DesignContext context)
    {
        var problem = DesignCheck.Check(operation, workspace, context);
        if (problem is null)
        {
            return new DesignValidation(null);
        }

        var alternatives = problem.Alternatives.Count > 0 ? problem.Alternatives : DesignAlternatives.For(operation, problem, workspace, context);
        return new DesignValidation(problem with { Alternatives = alternatives });
    }

    /// <summary>
    /// Applies design operations in order, each on its own: a refused operation changes nothing, says why and offers the nearest ones that would be
    /// accepted, and the operations after it still run against the design as it then is. Applied operations are lowered to Scene edits and applied through
    /// the engine, so the document stays one Scene accepts.
    /// </summary>
    /// <param name="workspace">The design to start from.</param>
    /// <param name="operations">The operations.</param>
    /// <param name="context">The context.</param>
    /// <returns>The design after, and what happened to each operation.</returns>
    public static DesignApplyResult Apply(DesignWorkspace workspace, IEnumerable<DesignOperation> operations, DesignContext context)
    {
        var current = workspace;
        List<DesignOutcome> outcomes = [];
        foreach (var operation in operations)
        {
            var validation = Validate(operation, current, context);
            if (validation.Refusal is { } refusal)
            {
                outcomes.Add(Refused(operation, refusal.Code, refusal.Reason, refusal.Alternatives));
                continue;
            }

            var (next, outcome) = ApplyOne(current, operation, context);
            current = next;
            outcomes.Add(outcome);
        }

        var changed = outcomes.Exists(outcome => outcome.Applied && outcome.Operation is not TweaksOperation and not VariationsOperation);
        return new DesignApplyResult(current, outcomes, changed);
    }

    static DesignOutcome Refused(DesignOperation operation, string code, string reason, IReadOnlyList<DesignAlternative>? alternatives, IEnumerable<DesignDiagnostic>? extra = null)
    {
        var diagnostic = new DesignDiagnostic(code, "error", reason, operation.TargetScreen(), operation.TargetTemplate(), operation.TargetElement());
        return new DesignOutcome(operation, false, [diagnostic, .. extra ?? []], [], null, code, reason, alternatives ?? []);
    }

    static (DesignWorkspace Workspace, DesignOutcome Outcome) ApplyOne(DesignWorkspace workspace, DesignOperation operation, DesignContext context)
    {
        if (operation is VariationsOperation variations)
        {
            var candidates = DesignVariations.Make(variations.Screen, variations.Templates, workspace, context);
            return (workspace, new DesignOutcome(operation, true, [], [], DesignMessages.VariationsOffered(candidates.Count, variations.Screen), Variations: candidates));
        }

        if (operation is TweaksOperation tweaks)
        {
            return (workspace, new DesignOutcome(operation, true, [], [], DesignMessages.TweaksOffered(tweaks.Controls.Count), Controls: tweaks.Controls));
        }

        var result = DesignLoweringApplier.Apply(workspace, DesignLowering.Lower(operation, workspace, context), context);
        if (result.Refusal is not null)
        {
            return (workspace, Refused(operation, DesignRefusalCode.SceneRefused, result.Refusal, [], result.Diagnostics));
        }

        List<DesignDiagnostic> diagnostics = [.. result.Diagnostics];
        if (operation is RemoveScreenOperation)
        {
            foreach (var link in ScreenLinks.FindDangling(result.Workspace.Document, result.Workspace.ScreenSet))
            {
                diagnostics.Add(new DesignDiagnostic("linkDangling", "warning", DesignMessages.DanglingLink(link.Element, link.To), link.From, null, link.Element, link.Prop));
            }
        }

        return (result.Workspace, new DesignOutcome(operation, true, diagnostics, result.SceneEdits, SummaryOf(operation, workspace, context), Focus: FocusOf(operation, result.SceneEdits)));
    }

    static string SummaryOf(DesignOperation operation, DesignWorkspace before, DesignContext context)
    {
        switch (operation)
        {
            case AddScreenOperation add: return DesignMessages.AddedScreen(add.Name, add.Template);
            case RemoveScreenOperation remove: return DesignMessages.RemovedScreen(remove.Name);
            case MoveScreenOperation move: return DesignMessages.MovedScreen(move.Name, move.Index);
            case AddTemplateOperation addTemplate: return DesignMessages.AddedTemplate(addTemplate.Name);
            case AddSlotOperation addSlot: return DesignMessages.AddedSlot(addSlot.Template, addSlot.Slot.Name);
            case RemoveSlotOperation removeSlot: return DesignMessages.RemovedSlot(removeSlot.Template, removeSlot.Slot);
            case ArrangeOperation arrange: return DesignMessages.Arranged(arrange.Template);
            case InsertOperation insert: return DesignMessages.AddedComponent(DesignCatalogueLookup.FindComponent(context.Catalogue, insert.Component)!.Label, insert.Outlet);
            case SetOperation set:
                var target = DocumentLookup.ResolveTarget(before.Document, set.Screen, set.Template)!;
                var name = DocumentLookup.ComponentNameOf(DocumentLookup.FindElement(target, set.Element)!.Element);
                return DesignMessages.SetProperty(set.Prop, DesignCatalogueLookup.FindComponent(context.Catalogue, name)?.Label ?? name);

            case RemoveOperation removeElement: return DesignMessages.RemovedElement(removeElement.Element);
            case MoveOperation moveElement: return DesignMessages.MovedElement(moveElement.Element, moveElement.Outlet);
            case LinkOperation link: return DesignMessages.Linked(link.Element, link.To);
            case ProfileOperation profile: return DesignMessages.ChangedProfile(profile.Key);
            default: return string.Empty;
        }
    }

    static DesignFocus? FocusOf(DesignOperation operation, IReadOnlyList<ScopedSceneEdit> sceneEdits)
    {
        switch (operation)
        {
            case AddScreenOperation add: return new DesignFocus(add.Name);
            case AddTemplateOperation addTemplate: return new DesignFocus(Template: addTemplate.Name);
            case AddSlotOperation or RemoveSlotOperation or ArrangeOperation: return new DesignFocus(Template: operation.TargetTemplate());
            case InsertOperation insert:
                var element = JsonNode.Parse(((InsertNodeEdit)sceneEdits[0].Edit).Element!.Value.GetRawText());
                return new DesignFocus(insert.Screen, insert.Template, DocumentLookup.Text(element, "id"));

            case SetOperation or MoveOperation or LinkOperation:
                return new DesignFocus(operation.TargetScreen(), operation.TargetTemplate(), operation.TargetElement());
            case RemoveOperation:
                return new DesignFocus(operation.TargetScreen(), operation.TargetTemplate());
            default: return null;
        }
    }
}
