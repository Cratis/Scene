// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Editing.Applying;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Applies lowered steps through the Scene engine. The TypeScript twin is <c language="text">applyLowering</c>.
/// </summary>
internal static class DesignLoweringApplier
{
    /// <summary>
    /// Writes the Scene engine's finding as a design diagnostic.
    /// </summary>
    /// <param name="diagnostic">The diagnostic.</param>
    /// <returns>The result.</returns>
    public static DesignDiagnostic ToDesignDiagnostic(SceneDiagnostic diagnostic) => new(
        $"scene.{SceneWords.Of(diagnostic.Code)}",
        SceneWords.Of(diagnostic.Severity),
        diagnostic.Message,
        Element: diagnostic.NodeId?.StartsWith("element:", StringComparison.Ordinal) == true ? diagnostic.NodeId["element:".Length..] : null,
        Path: diagnostic.Path);

    /// <summary>
    /// Gets the items with one declared, or replaced when the name is there.
    /// </summary>
    /// <param name="items">The items.</param>
    /// <param name="item">The item.</param>
    /// <param name="name">The name.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<JsonElement> WithItem(IReadOnlyList<JsonElement> items, JsonObject item, string name)
    {
        var element = JsonSerializer.SerializeToElement(item);
        var exists = items.Any(candidate => DocumentLookup.Text(JsonNode.Parse(candidate.GetRawText()), "name") == name);
        return exists
            ? [.. items.Select(candidate => DocumentLookup.Text(JsonNode.Parse(candidate.GetRawText()), "name") == name ? element : candidate)]
            : [.. items, element];
    }

    /// <summary>
    /// Puts a screen in place of the screen of its name, declaring the template it is built on when the document does not have it.
    /// </summary>
    /// <param name="workspace">The workspace.</param>
    /// <param name="screen">The screen.</param>
    /// <param name="template">The template.</param>
    /// <returns>The result.</returns>
    public static DesignWorkspace ReplaceScreen(DesignWorkspace workspace, JsonObject screen, JsonObject? template)
    {
        var document = workspace.Document;
        if (template is not null && DocumentLookup.FindByName(document.ScreenTemplates, DocumentLookup.Text(template, "name")!) is null)
        {
            document = document with { ScreenTemplates = WithItem(document.ScreenTemplates, template, DocumentLookup.Text(template, "name")!) };
        }

        var name = DocumentLookup.Text(screen, "name");
        var element = JsonSerializer.SerializeToElement(screen);
        return workspace with
        {
            Document = document with
            {
                Screens = [.. document.Screens.Select(candidate => DocumentLookup.Text(JsonNode.Parse(candidate.GetRawText()), "name") == name ? element : candidate)],
            },
        };
    }

    /// <summary>
    /// Applies lowered steps in order; if the engine refuses a Scene edit, nothing is applied.
    /// </summary>
    /// <param name="workspace">The workspace.</param>
    /// <param name="steps">The steps.</param>
    /// <param name="context">The context.</param>
    /// <returns>The result.</returns>
    public static LoweringResult Apply(DesignWorkspace workspace, IEnumerable<LoweredStep> steps, DesignContext context)
    {
        var current = workspace;
        List<DesignDiagnostic> diagnostics = [];
        List<ScopedSceneEdit> sceneEdits = [];
        var catalog = DescriptorCatalog.Create(context.Descriptors);
        foreach (var step in steps)
        {
            switch (step)
            {
                case SceneEditStep sceneEdit:
                    var outcome = EditApplier.Apply(current.Document, sceneEdit.Edit, new EditingContext(catalog, sceneEdit.Scope, context.QueryCandidates));
                    var found = outcome.Diagnostics.Select(ToDesignDiagnostic).ToList();
                    if (!outcome.Applied)
                    {
                        return new LoweringResult(workspace, found, [], string.Join(' ', outcome.Diagnostics.Select(diagnostic => diagnostic.Message)));
                    }

                    diagnostics.AddRange(found);
                    sceneEdits.Add(new ScopedSceneEdit(sceneEdit.Scope, sceneEdit.Edit));
                    current = current with { Document = outcome.Model };
                    break;

                case DeclareScreenStep declare:
                    current = current with { Document = current.Document with { Screens = [.. current.Document.Screens, JsonSerializer.SerializeToElement(declare.Screen)] } };
                    break;
                case DeclareTemplateStep declare:
                    current = current with { Document = current.Document with { ScreenTemplates = WithItem(current.Document.ScreenTemplates, declare.Template, DocumentLookup.Text(declare.Template, "name")!) } };
                    break;
                case RemoveScreenStep remove:
                    current = current with
                    {
                        Document = current.Document with
                        {
                            Screens = [.. current.Document.Screens.Where(candidate => DocumentLookup.Text(JsonNode.Parse(candidate.GetRawText()), "name") != remove.Name)],
                        },
                    };
                    break;
                case ProfileStep profile:
                    current = current with { Profile = DesignProfileOperations.Apply(current.Profile!, profile.Key, profile.Value) };
                    break;
                case ScreenSetStep screenSet:
                    current = current with
                    {
                        ScreenSet = screenSet.Change switch
                        {
                            "add" => current.ScreenSet.AddScreen(screenSet.Name),
                            "remove" => current.ScreenSet.RemoveScreen(screenSet.Name),
                            _ => current.ScreenSet.MoveScreen(screenSet.Name, screenSet.Index ?? 0),
                        },
                    };
                    break;
            }
        }

        return new LoweringResult(current, diagnostics, sceneEdits);
    }
}
