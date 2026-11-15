// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

public sealed record SceneModuleDocument(Guid SliceId, string ActorId, string Role, string Document)
{
    public string Module { get; init; } = string.Empty;
}

/// <summary>
/// The Scene documents of one module exported together. Screenplay 4.120 forms belong to the module, and a screen reaches
/// every module form for a command it names, so two documents declaring different forms for one command - or one form
/// name for different forms - cannot both travel typed; the later one keeps its exact document on the carrier.
/// </summary>
public static class SceneModuleExports
{
    /// <summary>
    /// Every document of the application, exported module by module. Screenplay then declares the layouts, templates,
    /// exposures and instance contributions they bring once, and every screen document reads all of them back - so a typed
    /// document that would read back more, or a different version of a declaration, keeps its exact document on the carrier.
    /// </summary>
    public static IReadOnlyDictionary<(Guid SliceId, string ActorId), SceneDocumentScreenplayExport> ForApplication(bool forStage, IEnumerable<SceneModuleDocument> documents)
    {
        // A document stored before Scene 5 is read in the slot shape (StudioIssues#1328), so it is compared and exported as Screenplay 6.
        var all = documents.Select(document => document with { Document = SceneDocumentUpgrade.Upgrade(document.Document) }).ToArray();
        var exports = new Dictionary<(Guid, string), SceneDocumentScreenplayExport>();
        foreach (var module in all.GroupBy(document => document.Module))
        {
            foreach (var (key, export) in For(module))
            {
                exports[key] = export;
            }
        }

        var declarations = SceneDeclarationSet.Merge(exports.Values.Select(export => export.Declarations));
        var screens = exports.Values.SelectMany(export => export.Screens).Select(screen => screen.Name).ToArray();
        foreach (var document in all)
        {
            var key = (document.SliceId, document.ActorId);
            if (exports[key] is not { IsTyped: true, Diagnostics.Count: 0 } export)
            {
                continue;
            }

            var parsed = JsonNode.Parse(document.Document);
            var verbatim = parsed is JsonObject stored && SceneNative.VerbatimNamesOf(stored, SceneJson.Array(stored, "screens").Select(screen => SceneJson.String(screen, "name") ?? string.Empty)) is not null;
            var reopened = SceneScreens.ToJson(ScreenplayIdentifier.From(document.Role), export.Screens, export.Forms, declarations, screens, verbatim);
            if (verbatim)
            {
                reopened.Remove(SceneNative.Member);
            }

            var original = SceneNative.WithoutResidue(parsed);

            // A document that states no navigation takes the application's: it has no opinion of its own to lose.
            if (original is JsonObject json && (SceneJson.Member(json, SceneNavigation.Member) is not { } stated || SceneDocumentCanonicalForm.Of(stated) == "{}"))
            {
                reopened.Remove(SceneNavigation.Member);
            }

            if (SceneDocumentCanonicalForm.FirstDifference(original, reopened) is { } difference)
            {
                exports[key] = SceneDocumentScreenplayBridge.Carry(
                    export,
                    document.ActorId,
                    document.Document,
                    $"Scene document member '{difference}' does not read back the same once the application's declarations are merged: Screenplay declares layouts, templates, exposures and instance contributions once for the application, and every screen document reads all of them back.");
            }
        }

        return forStage ? exports.ToDictionary(entry => entry.Key, entry => entry.Value.ForStage()) : exports;
    }

    public static IReadOnlyDictionary<(Guid SliceId, string ActorId), SceneDocumentScreenplayExport> For(IEnumerable<SceneModuleDocument> documents)
    {
        var exports = new Dictionary<(Guid, string), SceneDocumentScreenplayExport>();
        var byCommand = new Dictionary<string, string>(StringComparer.Ordinal);
        var byName = new Dictionary<string, string>(StringComparer.Ordinal);

        foreach (var document in documents)
        {
            var export = SceneDocumentScreenplayBridge.Export(document.Role, document.ActorId, document.Document);
            var forms = export.Forms.Where(form => !SceneDocumentCarrier.IsCarrier(form)).Select(form => (Form: form, Shape: Shape(form))).ToArray();
            var conflict = forms.FirstOrDefault(entry =>
                (byCommand.TryGetValue(entry.Form.For, out var command) && command != entry.Shape) ||
                (byName.TryGetValue(entry.Form.Name, out var name) && name != entry.Shape));

            if (conflict.Form is { } form)
            {
                export = SceneDocumentScreenplayBridge.Preserve(
                    document.Role,
                    document.ActorId,
                    document.Document,
                    $"Scene form '{form.Name}' for '{form.For}' cannot travel as typed Screenplay: Screenplay {ScreenplayVersion.Current} forms belong to the module, and another screen in the module declares a different form for that command or name.");
            }
            else
            {
                foreach (var (typed, shape) in forms)
                {
                    byCommand.TryAdd(typed.For, shape);
                    byName.TryAdd(typed.Name, shape);
                }
            }

            exports[(document.SliceId, document.ActorId)] = export;
        }

        return exports;
    }

    public static IEnumerable<FormSyntax> Forms(IEnumerable<SceneDocumentScreenplayExport> exports) =>
        exports.SelectMany(export => export.Forms).GroupBy(form => form.Name, StringComparer.Ordinal).Select(group => group.First());

    static string Shape(FormSyntax form) =>
        SceneDocumentCanonicalForm.Of(SceneForms.ToJson(form, new SceneScreenNames(string.Empty, [])));
}
