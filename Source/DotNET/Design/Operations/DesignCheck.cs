// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Catalogue;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Checks an operation against the catalogue and the design as it is. The TypeScript twin is <c language="text">checkOperation</c>.
/// </summary>
internal static class DesignCheck
{
    /// <summary>
    /// Checks an operation against the catalogue and the design as it is.
    /// </summary>
    /// <param name="operation">The operation.</param>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <returns>The result.</returns>
    public static DesignRefusal? Check(DesignOperation operation, DesignWorkspace workspace, DesignContext context)
    {
        var catalogue = context.Catalogue;
        var document = workspace.Document;
        switch (operation)
        {
            case AddScreenOperation add:
                var problem = TemplateRefusal(context, add.Template);
                if (problem is not null)
                {
                    return problem;
                }

                if (DocumentLookup.FindByName(document.Screens, add.Name) is not null || workspace.ScreenSet.Screens.Contains(add.Name))
                {
                    return DesignRefusal.Of(DesignRefusalCode.ScreenExists, DesignMessages.ScreenExists(add.Name));
                }

                var layout = workspace.Profile?.Layout ?? (document.Layouts.Count > 0 ? DocumentLookup.Text(JsonNode.Parse(document.Layouts[0].GetRawText()), "name") : null);
                return layout is null ? DesignRefusal.Of(DesignRefusalCode.NoLayout, DesignMessages.NoLayout) : null;

            case RemoveScreenOperation remove:
                return ScreenMissing(document, remove.Name);
            case MoveScreenOperation move:
                return ScreenMissing(document, move.Name);
            case AddTemplateOperation addTemplate:
                return CheckAddTemplate(addTemplate, workspace, context);
            case AddSlotOperation addSlot:
                return CheckSlotChange(addSlot, addSlot.Template, workspace, context);
            case RemoveSlotOperation removeSlot:
                return CheckSlotChange(removeSlot, removeSlot.Template, workspace, context);
            case ArrangeOperation arrange:
                return CheckSlotChange(arrange, arrange.Template, workspace, context);
            case InsertOperation insert:
                return CheckInsert(insert, workspace, context);
            case SetOperation or RemoveOperation or MoveOperation or LinkOperation:
                return CheckElementChange(operation, workspace, context);
            case ProfileOperation profile:
                return DesignProfileOperations.Check(catalogue, profile.Key, profile.Value)
                    ?? (workspace.Profile is null ? DesignRefusal.Of(DesignRefusalCode.NoProfile, DesignMessages.NoProfile) : null);
            case VariationsOperation variations:
                return CheckVariations(variations, workspace, context);
            case TweaksOperation tweaks:
                if (tweaks.Controls.Count > DesignLimits.MaximumTweaks)
                {
                    return DesignRefusal.Of(DesignRefusalCode.TooManyControls, DesignMessages.TooManyControls(DesignLimits.MaximumTweaks));
                }

                var unresolved = tweaks.Controls.FirstOrDefault(control => DesignTweaks.Resolve(control, workspace, context) is null);
                return unresolved is null ? null : DesignRefusal.Of(DesignRefusalCode.TweakUnresolved, DesignMessages.TweakUnresolved(unresolved.Label));

            case RefuseOperation refuse:
                return new DesignRefusal(
                    refuse.Code.Length == 0 ? DesignRefusalCode.FreeStylingNotAllowed : refuse.Code,
                    refuse.Reason.Length == 0 ? DesignMessages.RefusedByDefault : refuse.Reason,
                    refuse.Alternatives ?? []);
            default:
                return DesignRefusal.Of(DesignRefusalCode.EditUnknown, DesignMessages.EditUnknown(operation.Op));
        }
    }

    /// <summary>
    /// Gets what each outlet of a target takes: the catalogue's rules for a screen's template, and anything for an outlet nothing is known about.
    /// </summary>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <param name="target">The target.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<DesignOutletRule> OutletRulesFor(DesignWorkspace workspace, DesignContext context, ResolvedTarget target)
    {
        var names = DocumentLookup.OutletNamesOf(workspace.Document, target);
        var templateName = target.IsScreen ? DocumentLookup.Text(target.Value, "screenTemplate") : null;
        var entry = templateName is null ? null : DesignCatalogueLookup.FindTemplate(context.Catalogue, templateName);
        return [.. names.Select(name => entry?.Outlets.FirstOrDefault(outlet => outlet.Name == name) ?? new DesignOutletRule(name, [], [], true))];
    }

    /// <summary>
    /// Determines whether a template is outside the set the design may use.
    /// </summary>
    /// <param name="context">The context.</param>
    /// <param name="name">The name.</param>
    /// <returns>The result.</returns>
    public static bool TemplateOutsideSet(DesignContext context, string name) =>
        context.Catalogue.TemplateSet?.Contains(name) == false;

    /// <summary>
    /// Gets why a template cannot be used: it is outside the set the design may use, or not in the catalogue.
    /// </summary>
    /// <param name="context">The context.</param>
    /// <param name="name">The name.</param>
    /// <returns>The result.</returns>
    public static DesignRefusal? TemplateRefusal(DesignContext context, string name)
    {
        if (TemplateOutsideSet(context, name))
        {
            return DesignRefusal.Of(DesignRefusalCode.TemplateNotInSet, DesignMessages.TemplateNotInSet(name, context.Catalogue.TemplateSet!));
        }

        return DesignCatalogueLookup.FindTemplate(context.Catalogue, name) is null
            ? DesignRefusal.Of(DesignRefusalCode.TemplateNotInCatalogue, DesignMessages.TemplateNotInCatalogue(name, context.Catalogue.Templates.Select(template => template.Name)))
            : null;
    }

    /// <summary>
    /// Resolves the screen or the template an operation names.
    /// </summary>
    /// <param name="screen">The screen.</param>
    /// <param name="template">The template.</param>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <returns>The target, or why there is none.</returns>
    public static (ResolvedTarget? Target, DesignRefusal? Refusal) ResolveOperationTarget(string? screen, string? template, DesignWorkspace workspace, DesignContext context)
    {
        if ((screen is null) == (template is null))
        {
            return (null, DesignRefusal.Of(DesignRefusalCode.TargetMissing, DesignMessages.TargetMissing));
        }

        if (template is not null && TemplateOutsideSet(context, template))
        {
            return (null, DesignRefusal.Of(DesignRefusalCode.TemplateNotInSet, DesignMessages.TemplateNotInSet(template, context.Catalogue.TemplateSet!)));
        }

        var target = DocumentLookup.ResolveTarget(workspace.Document, screen, template);
        if (target is not null)
        {
            return (target, null);
        }

        return (null, screen is not null
            ? DesignRefusal.Of(DesignRefusalCode.ScreenUnknown, DesignMessages.ScreenUnknown(screen))
            : DesignRefusal.Of(DesignRefusalCode.TemplateUnknown, DesignMessages.TemplateUnknown(template!)));
    }

    /// <summary>
    /// Gets why a component may not be placed in an outlet of a target, when it may not.
    /// </summary>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <param name="target">The target.</param>
    /// <param name="outletName">The outlet name.</param>
    /// <param name="componentName">The component name.</param>
    /// <returns>The result.</returns>
    public static DesignRefusal? PlacementRefusal(DesignWorkspace workspace, DesignContext context, ResolvedTarget target, string outletName, string componentName)
    {
        var component = DesignCatalogueLookup.FindComponent(context.Catalogue, componentName);
        if (component is null)
        {
            return DesignRefusal.Of(DesignRefusalCode.ComponentNotInCatalogue, DesignMessages.ComponentNotInCatalogue(componentName));
        }

        if (component.Placement == DesignPlacement.Overlay)
        {
            return DesignRefusal.Of(DesignRefusalCode.OverlayNeedsAction, DesignMessages.OverlayNeedsAction(component.Label));
        }

        if (component.Placement == DesignPlacement.Shell)
        {
            return DesignRefusal.Of(DesignRefusalCode.ShellComponent, DesignMessages.ShellComponent(component.Label));
        }

        var rules = OutletRulesFor(workspace, context, target);
        var homes = DesignCatalogueLookup.HomesOf(rules, component);
        var outlet = rules.FirstOrDefault(candidate => candidate.Name == outletName);
        if (outlet is null)
        {
            return new DesignRefusal(DesignRefusalCode.OutletUnknown, DesignMessages.OutletUnknown(target.Name, outletName, homes), [], homes);
        }

        if (!DesignCatalogueLookup.Accepts(outlet, component))
        {
            return new DesignRefusal(DesignRefusalCode.OutletDoesNotAccept, DesignMessages.OutletDoesNotAccept(outletName, component.Label, homes), [], homes);
        }

        var count = (DocumentLookup.ContentOf(target)[outletName] as JsonArray)?.Count ?? 0;
        return outlet.Max is { } max && count >= max
            ? new DesignRefusal(DesignRefusalCode.OutletFull, DesignMessages.OutletFull(outletName, max), [], [.. homes.Where(home => home != outletName)])
            : null;
    }

    static DesignRefusal? ScreenMissing(Cratis.Scene.Model.Editing.SceneDocument document, string name) =>
        DocumentLookup.FindByName(document.Screens, name) is null ? DesignRefusal.Of(DesignRefusalCode.ScreenUnknown, DesignMessages.ScreenUnknown(name)) : null;

    static HashSet<string> ReferencedSlots(JsonNode? arrangement)
    {
        var found = new HashSet<string>(StringComparer.Ordinal);
        Collect(arrangement, found);
        return found;
    }

    static void Collect(JsonNode? node, HashSet<string> found)
    {
        switch (node)
        {
            case JsonArray array:
                foreach (var item in array)
                {
                    Collect(item, found);
                }

                break;
            case JsonObject record:
                if (DocumentLookup.Text(record, "slotName") is { } slot)
                {
                    found.Add(slot);
                }

                foreach (var (_, child) in record)
                {
                    Collect(child, found);
                }

                break;
        }
    }

    static DesignRefusal? ArrangementRefusal(JsonNode? arrangement, IReadOnlyList<string> slots)
    {
        var unknown = ReferencedSlots(arrangement).FirstOrDefault(slot => !slots.Contains(slot));
        return unknown is null ? null : DesignRefusal.Of(DesignRefusalCode.ArrangementInvalid, DesignMessages.ArrangementInvalid(unknown));
    }

    static DesignRefusal? CheckAddTemplate(AddTemplateOperation operation, DesignWorkspace workspace, DesignContext context)
    {
        if (TemplateOutsideSet(context, operation.Name))
        {
            return DesignRefusal.Of(DesignRefusalCode.TemplateNotInSet, DesignMessages.TemplateNotInSet(operation.Name, context.Catalogue.TemplateSet!));
        }

        if (DocumentLookup.FindByName(workspace.Document.ScreenTemplates, operation.Name) is not null)
        {
            return DesignRefusal.Of(DesignRefusalCode.TemplateExists, DesignMessages.TemplateExists(operation.Name));
        }

        var names = operation.Slots.Select(slot => slot.Name).ToList();
        if (names.Contains(string.Empty))
        {
            return DesignRefusal.Of(DesignRefusalCode.SlotUnknown, DesignMessages.SlotNameMissing);
        }

        var duplicate = names.Where((name, index) => names.IndexOf(name) != index).FirstOrDefault();
        if (duplicate is not null)
        {
            return DesignRefusal.Of(DesignRefusalCode.SlotExists, DesignMessages.SlotExists(operation.Name, duplicate));
        }

        return operation.Arrangement is null ? null : ArrangementRefusal(JsonNode.Parse(operation.Arrangement.Value.GetRawText()), names);
    }

    static DesignRefusal? CheckSlotChange(DesignOperation operation, string templateName, DesignWorkspace workspace, DesignContext context)
    {
        var (target, refusal) = ResolveOperationTarget(null, templateName, workspace, context);
        if (refusal is not null)
        {
            return refusal;
        }

        var template = target!.Value;
        var slots = DocumentLookup.SlotNames(template["slots"]);
        switch (operation)
        {
            case AddSlotOperation add:
                if (add.Slot.Name.Length == 0)
                {
                    return DesignRefusal.Of(DesignRefusalCode.SlotUnknown, DesignMessages.SlotNameMissing);
                }

                return slots.Contains(add.Slot.Name) ? DesignRefusal.Of(DesignRefusalCode.SlotExists, DesignMessages.SlotExists(add.Template, add.Slot.Name)) : null;
            case RemoveSlotOperation remove:
                if (!slots.Contains(remove.Slot))
                {
                    return DesignRefusal.Of(DesignRefusalCode.SlotUnknown, DesignMessages.SlotUnknown(remove.Template, remove.Slot));
                }

                return ReferencedSlots(template["arrangement"]).Contains(remove.Slot) ? DesignRefusal.Of(DesignRefusalCode.SlotInUse, DesignMessages.SlotInUse(remove.Template, remove.Slot)) : null;
            case ArrangeOperation arrange:
                return ArrangementRefusal(JsonNode.Parse(arrange.Arrangement.GetRawText()), slots);
            default:
                return null;
        }
    }

    static DesignRefusal? CheckInsert(InsertOperation insert, DesignWorkspace workspace, DesignContext context)
    {
        var (target, refusal) = ResolveOperationTarget(insert.Screen, insert.Template, workspace, context);
        if (refusal is not null)
        {
            return refusal;
        }

        var problem = PlacementRefusal(workspace, context, target!, insert.Outlet, insert.Component);
        if (problem is not null)
        {
            return problem;
        }

        if (insert.Id is not null && DocumentLookup.IdsInDocument(workspace.Document).Contains(insert.Id))
        {
            return DesignRefusal.Of(DesignRefusalCode.ElementIdTaken, DesignMessages.ElementIdTaken(insert.Id));
        }

        var component = DesignCatalogueLookup.FindComponent(context.Catalogue, insert.Component)!;
        foreach (var (name, value) in insert.Props ?? new Dictionary<string, JsonElement>())
        {
            var bad = DesignValues.CheckProperty(component, name, value, context.Catalogue);
            if (bad is not null)
            {
                return bad;
            }
        }

        return null;
    }

    static DesignRefusal? CheckElementChange(DesignOperation operation, DesignWorkspace workspace, DesignContext context)
    {
        var (target, refusal) = ResolveOperationTarget(operation.TargetScreen(), operation.TargetTemplate(), workspace, context);
        if (refusal is not null)
        {
            return refusal;
        }

        var elementId = operation.TargetElement()!;
        var place = DocumentLookup.FindElement(target!, elementId);
        if (place is null)
        {
            return DesignRefusal.Of(DesignRefusalCode.ElementUnknown, DesignMessages.ElementUnknown(elementId));
        }

        if (operation is RemoveOperation)
        {
            return null;
        }

        var componentName = DocumentLookup.ComponentNameOf(place.Element);
        if (operation is MoveOperation move)
        {
            return move.Outlet == place.Outlet ? null : PlacementRefusal(workspace, context, target!, move.Outlet, componentName);
        }

        var component = DesignCatalogueLookup.FindComponent(context.Catalogue, componentName);
        if (component is null)
        {
            return DesignRefusal.Of(DesignRefusalCode.ComponentNotInCatalogue, DesignMessages.ComponentNotInCatalogue(componentName));
        }

        if (operation is SetOperation set)
        {
            return DesignValues.CheckProperty(component, set.Prop, set.Value, context.Catalogue);
        }

        var link = (LinkOperation)operation;
        var property = link.Prop is null
            ? component.Properties.FirstOrDefault(candidate => candidate.Kind == DesignValueKind.Destination)
            : component.Properties.FirstOrDefault(candidate => candidate.Name == link.Prop);
        if (property is null || property.Kind != DesignValueKind.Destination)
        {
            return DesignRefusal.Of(DesignRefusalCode.NoDestinationProperty, DesignMessages.NoDestinationProperty(component.Label));
        }

        return DocumentLookup.FindByName(workspace.Document.Screens, link.To) is not null
            ? null
            : DesignRefusal.Of(DesignRefusalCode.DestinationUnknown, DesignMessages.DestinationUnknown(link.To));
    }

    static DesignRefusal? CheckVariations(VariationsOperation variations, DesignWorkspace workspace, DesignContext context)
    {
        if (DocumentLookup.FindByName(workspace.Document.Screens, variations.Screen) is null)
        {
            return DesignRefusal.Of(DesignRefusalCode.ScreenUnknown, DesignMessages.ScreenUnknown(variations.Screen));
        }

        var templates = variations.Templates ?? [];
        if (templates.Count > DesignLimits.MaximumVariations)
        {
            return DesignRefusal.Of(DesignRefusalCode.TooManyTemplates, DesignMessages.TooManyTemplates(DesignLimits.MaximumVariations));
        }

        return templates.Select(name => TemplateRefusal(context, name)).FirstOrDefault(problem => problem is not null);
    }
}
