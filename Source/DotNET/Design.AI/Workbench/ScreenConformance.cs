// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.AI.Workbench;

/// <summary>
/// Checks a screen that was written as Screenplay against the catalogue, the way the design operations check each edit: only what the catalogue
/// offers, only where it fits, and no style of its own.
/// </summary>
/// <remarks>
/// It reuses the checks of the design operations, so a screen written whole is held to what an edit would be held to. A property the catalogue does not
/// list is a warning unless it is free styling - the converter of Screenplay sets members of its own that a component descriptor does not list.
/// </remarks>
internal static class ScreenConformance
{
    /// <summary>
    /// Checks a screen, or a screen template, of a workspace.
    /// </summary>
    /// <param name="workspace">The workspace the screen is in.</param>
    /// <param name="context">The context.</param>
    /// <param name="name">The name of the screen or the screen template.</param>
    /// <param name="isTemplate">Whether it is a screen template.</param>
    /// <returns>What is wrong with it; empty when it conforms.</returns>
    public static IReadOnlyList<DesignDiagnostic> Check(DesignWorkspace workspace, DesignContext context, string name, bool isTemplate)
    {
        var target = DocumentLookup.ResolveTarget(workspace.Document, isTemplate ? null : name, isTemplate ? name : null);
        if (target is null)
        {
            return [];
        }

        List<DesignDiagnostic> diagnostics = [];
        if (!isTemplate && DocumentLookup.Text(target.Value, "screenTemplate") is { } template && DesignCheck.TemplateRefusal(context, template) is { } refused)
        {
            diagnostics.Add(Error(refused, name, null, null));
        }

        var rules = DesignCheck.OutletRulesFor(workspace, context, target);
        foreach (var (outlet, elements) in DocumentLookup.ContentOf(target))
        {
            var placed = (elements as JsonArray)?.OfType<JsonObject>().ToList() ?? [];
            var rule = rules.FirstOrDefault(candidate => candidate.Name == outlet);
            if (rule?.Max is { } max && placed.Count > max)
            {
                diagnostics.Add(Error(DesignRefusal.Of(DesignRefusalCode.OutletFull, DesignMessages.OutletFull(outlet, max)), name, outlet, null));
            }

            foreach (var element in placed)
            {
                Element(element, outlet, rule, rules, context, name, isTemplate, diagnostics);
            }
        }

        return diagnostics;
    }

    static void Element(JsonObject element, string outlet, DesignOutletRule? rule, IReadOnlyList<DesignOutletRule> rules, DesignContext context, string screen, bool isTemplate, List<DesignDiagnostic> diagnostics)
    {
        var id = DocumentLookup.Text(element, "id");
        var componentName = DocumentLookup.ComponentNameOf(element);
        var component = DesignCatalogueLookup.FindComponent(context.Catalogue, componentName);
        if (component is null)
        {
            diagnostics.Add(Error(DesignRefusal.Of(DesignRefusalCode.ComponentNotInCatalogue, DesignMessages.ComponentNotInCatalogue(componentName)), screen, outlet, id));
            return;
        }

        if (rule is not null)
        {
            var problem = PlacementProblem(rule, rules, component, outlet);
            if (problem is not null)
            {
                diagnostics.Add(Error(problem, screen, outlet, id));
            }
        }

        foreach (var (property, value) in element["properties"] as JsonObject ?? [])
        {
            if (value is null)
            {
                continue;
            }

            var refusal = DesignValues.CheckProperty(component, property, JsonSerializer.SerializeToElement(value), context.Catalogue);
            if (refusal is null)
            {
                continue;
            }

            var isWarning = refusal.Code == DesignRefusalCode.PropertyUnknown;
            diagnostics.Add(new DesignDiagnostic(refusal.Code, isWarning ? "warning" : "error", refusal.Reason, isTemplate ? null : screen, isTemplate ? screen : null, id, property));
        }

        foreach (var (_, children) in element["slots"] as JsonObject ?? [])
        {
            foreach (var child in (children as JsonArray)?.OfType<JsonObject>() ?? [])
            {
                Element(child, outlet, null, rules, context, screen, isTemplate, diagnostics);
            }
        }
    }

    static DesignRefusal? PlacementProblem(DesignOutletRule rule, IReadOnlyList<DesignOutletRule> rules, DesignComponentEntry component, string outlet)
    {
        if (component.Placement == DesignPlacement.Overlay)
        {
            return DesignRefusal.Of(DesignRefusalCode.OverlayNeedsAction, DesignMessages.OverlayNeedsAction(component.Label));
        }

        if (component.Placement == DesignPlacement.Shell)
        {
            return DesignRefusal.Of(DesignRefusalCode.ShellComponent, DesignMessages.ShellComponent(component.Label));
        }

        if (DesignCatalogueLookup.Accepts(rule, component))
        {
            return null;
        }

        var homes = DesignCatalogueLookup.HomesOf(rules, component);
        return new DesignRefusal(DesignRefusalCode.OutletDoesNotAccept, DesignMessages.OutletDoesNotAccept(outlet, component.Label, homes), [], homes);
    }

    static DesignDiagnostic Error(DesignRefusal refusal, string screen, string? outlet, string? element) =>
        new(refusal.Code, "error", refusal.Reason, screen, null, element, outlet);
}
