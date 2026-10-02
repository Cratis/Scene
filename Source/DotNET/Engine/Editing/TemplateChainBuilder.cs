// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Assembles the chain of owners an editing scope sits inside - the layout, each template down to the one the scope is in, and
/// the scope itself - the way the TypeScript engine's resolveTemplateChain does, so a server and an editor see the same nesting.
/// Nesting is placed by the same ScreenTemplateResolver the rest of the engine uses.
/// </summary>
static class TemplateChainBuilder
{
    /// <summary>
    /// Assembles the chain a scope sits inside.
    /// </summary>
    /// <param name="scope">The scope.</param>
    /// <param name="document">The document, completed from what it inherits from.</param>
    /// <returns>The chain, outermost first; empty when the scope is not in the document.</returns>
    public static IReadOnlyList<TemplateChainLevel> Build(EditingScope scope, CompletedDocument document) => scope.Kind switch
    {
        EditingScopeKind.Layout => document.Layout(scope.Name) is { } layout ? [Level("layout", scope.Name, layout, document)] : [],
        EditingScopeKind.DialogTemplate => document.DialogTemplate(scope.Name) is { } dialog ? [Level("dialog", scope.Name, dialog, document)] : [],
        EditingScopeKind.ScreenTemplate => ForTemplate(scope, document),
        _ => ForScreen(scope, document)
    };

    static IReadOnlyList<TemplateChainLevel> ForTemplate(EditingScope scope, CompletedDocument document)
    {
        if (document.ScreenTemplate(scope.Name) is not { } template)
        {
            return [];
        }

        var layoutName = scope.Layout ?? SoleLayout(document);
        if (layoutName is null || document.Layout(layoutName) is not { } layout)
        {
            return [Level("template", scope.Name, template, document)];
        }

        return [Level("layout", layoutName, layout, document), .. TemplateLevels(layoutName, layout, scope.Name, document)];
    }

    static List<TemplateChainLevel> ForScreen(EditingScope scope, CompletedDocument document)
    {
        if (document.Screen(scope.Name) is not { } screen)
        {
            return [];
        }

        var levels = new List<TemplateChainLevel>();
        var layoutName = JsonData.String(screen, "layout");
        var templateName = JsonData.String(screen, "screenTemplate");
        var layout = layoutName is null ? null : document.Layout(layoutName);
        var template = templateName is null ? null : document.ScreenTemplate(templateName);

        if (layout is { } && layoutName is not null)
        {
            levels.Add(Level("layout", layoutName, layout.Value, document));
        }

        if (layout is { } && layoutName is not null && templateName is not null && template is { })
        {
            levels.AddRange(TemplateLevels(layoutName, layout.Value, templateName, document));
        }
        else if (templateName is not null && template is { })
        {
            levels.Add(Level("template", templateName, template.Value, document));
        }

        levels.Add(Level("screen", scope.Name, screen, document));
        return levels;
    }

    static IReadOnlyList<TemplateChainLevel> TemplateLevels(string layoutName, JsonElement layout, string templateName, CompletedDocument document)
    {
        var templates = document.ScreenTemplateNames
            .Select(name => (Name: name, Element: document.ScreenTemplate(name)!.Value))
            .Select(entry => new ScreenTemplate(entry.Name, JsonData.String(entry.Element, "fitsSlot"), Slots(entry.Element)))
            .ToList();
        var placements = ScreenTemplateResolver.Resolve(new Layout(layoutName, Slots(layout)), templates).Placements;

        var ancestry = new List<string> { templateName };
        var current = templateName;
        for (var guard = 0; guard <= templates.Count; guard++)
        {
            var placement = placements.FirstOrDefault(candidate => candidate.Template == current);
            if (placement is null || placement.Container == layoutName || document.ScreenTemplate(placement.Container) is null)
            {
                break;
            }

            ancestry.Insert(0, placement.Container);
            current = placement.Container;
        }

        var placed = placements.Any(placement => placement.Template == ancestry[0]);
        var names = placed ? ancestry : [templateName];
        return [.. names.Select(name => Level("template", name, document.ScreenTemplate(name)!.Value, document))];
    }

    static TemplateChainLevel Level(string prefix, string name, JsonElement element, CompletedDocument document) =>
        new(name, $"{prefix}:{name}", ComponentCollector.Collect(element), document.Exposure(name)?.Declaration?.Properties ?? []);

    static string? SoleLayout(CompletedDocument document)
    {
        var names = document.LayoutNames.ToList();
        return names.Count == 1 ? names[0] : null;
    }

    static List<Slot> Slots(JsonElement owner) =>
        [.. JsonData.Array(owner, "slots").Select(slot => new Slot(JsonData.String(slot, "name") ?? string.Empty))];
}
