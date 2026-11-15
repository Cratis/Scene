// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Assembles the chain of owners an editing scope sits inside: the layout, each template down to the one the scope is in, and the
/// scope itself. The same chain feeds the effective configuration for the runtime and the editor, so both see the same nesting.
/// </summary>
sealed class TemplateChainResolver
{
    readonly SceneDocument _document;
    readonly JsonObject _root;

    TemplateChainResolver(SceneDocument document, JsonObject root)
    {
        _document = document;
        _root = root;
    }

    /// <summary>
    /// Assembles the chain a scope sits inside. A scope that cannot be found yields an empty chain with an error diagnostic.
    /// </summary>
    /// <param name="document">The document, for what each owner exposes.</param>
    /// <param name="root">The document as data.</param>
    /// <param name="scope">What is being edited.</param>
    /// <returns>The chain, outermost first.</returns>
    public static TemplateChain Resolve(SceneDocument document, JsonObject root, EditingScope scope) => new TemplateChainResolver(document, root).Resolve(scope);

    static List<Slot> Slots(JsonNode? owner) => [.. Data.List(owner, "slots").Select(slot => new Slot(Data.Text(slot, "name") ?? string.Empty))];

    TemplateChain Resolve(EditingScope scope)
    {
        var chain = new TemplateChain();

        switch (scope.Kind)
        {
            case EditingScopeKind.Layout:
                if (Find("layouts", scope.Name) is { } layoutOwner)
                {
                    chain.Levels.Add(Level(SceneNodeKind.Layout, "layout", layoutOwner));
                }

                break;

            case EditingScopeKind.DialogTemplate:
                if (Find("dialogTemplates", scope.Name) is { } dialog)
                {
                    chain.Levels.Add(Level(SceneNodeKind.DialogTemplate, "dialog", dialog));
                }

                break;

            case EditingScopeKind.ScreenTemplate:
                {
                    var template = Find("screenTemplates", scope.Name);
                    var layouts = Data.List(_root, "layouts");
                    var layout = Find("layouts", scope.Layout) ?? (scope.Layout is null && layouts.Count == 1 ? layouts[0] : null);
                    if (template is not null && layout is not null)
                    {
                        chain.Levels.Add(Level(SceneNodeKind.Layout, "layout", layout));
                        chain.Levels.AddRange(TemplateLevels(layout, template, chain));
                    }
                    else if (template is not null)
                    {
                        chain.Levels.Add(Level(SceneNodeKind.ScreenTemplate, "template", template));
                    }

                    break;
                }

            default:
                {
                    if (Find("screens", scope.Name) is not { } screen)
                    {
                        break;
                    }

                    var layout = Find("layouts", Data.Text(screen, "layout"));
                    var templateName = Data.Text(screen, "screenTemplate");
                    var template = templateName is null ? null : Find("screenTemplates", templateName);
                    if (layout is not null)
                    {
                        chain.Levels.Add(Level(SceneNodeKind.Layout, "layout", layout));
                    }

                    if (layout is not null && template is not null)
                    {
                        chain.Levels.AddRange(TemplateLevels(layout, template, chain));
                    }
                    else if (template is not null)
                    {
                        chain.Levels.Add(Level(SceneNodeKind.ScreenTemplate, "template", template));
                    }

                    chain.Levels.Add(Level(SceneNodeKind.Screen, "screen", screen));
                    break;
                }
        }

        if (chain.Levels.Count == 0)
        {
            chain.Diagnostics.Add(Finding.Error(DiagnosticCode.UnknownScope, $"There is no {LayoutTypeNames.Of(scope.Kind)} named '{scope.Name}'."));
        }

        return chain;
    }

    JsonNode? Find(string key, string? name) => name is null ? null : Data.List(_root, key).FirstOrDefault(candidate => Data.Text(candidate, "name") == name);

    TemplateChainLevel Level(SceneNodeKind kind, string prefix, JsonNode owner)
    {
        var name = Data.Text(owner, "name") ?? string.Empty;
        return new(name, kind, $"{prefix}:{name}", ComponentWalker.Collect(owner), _document.Exposures.FirstOrDefault(declaration => declaration.Owner == name)?.Properties ?? []);
    }

    List<TemplateChainLevel> TemplateLevels(JsonNode layout, JsonNode template, TemplateChain chain)
    {
        var templates = Data.List(_root, "screenTemplates");
        var templateModels = templates.Select(item => new ScreenTemplate(Data.Text(item, "name") ?? string.Empty, Data.Text(item, "fitsSlot"), Slots(item))).ToList();
        var layoutName = Data.Text(layout, "name") ?? string.Empty;
        var placements = ScreenTemplateResolver.Resolve(new Layout(layoutName, Slots(layout)), templateModels).Placements;

        var ancestry = new List<JsonNode> { template };
        var current = Data.Text(template, "name");
        for (var guard = 0; guard <= templates.Count; guard++)
        {
            var placement = placements.FirstOrDefault(candidate => candidate.Template == current);
            if (placement is null || placement.Container == layoutName)
            {
                break;
            }

            var parent = templates.FirstOrDefault(candidate => Data.Text(candidate, "name") == placement.Container);
            if (parent is null)
            {
                break;
            }

            ancestry.Insert(0, parent);
            current = Data.Text(parent, "name");
        }

        var outermost = Data.Text(ancestry[0], "name");
        if (!placements.Any(placement => placement.Template == outermost))
        {
            chain.Diagnostics.Add(Finding.Warning(
                DiagnosticCode.UnknownScope,
                $"The template '{outermost}' could not be placed in the layout '{layoutName}', so nothing outside it is part of the chain."));
            return [Level(SceneNodeKind.ScreenTemplate, "template", ancestry[^1])];
        }

        return [.. ancestry.Select(item => Level(SceneNodeKind.ScreenTemplate, "template", item))];
    }
}
