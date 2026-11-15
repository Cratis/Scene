// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// What Scene documents declare beside their screens - layouts, screen and dialog templates, exposures and instance
/// contributions. Screenplay declares each of them once for the whole application, so documents are merged by name with
/// the first declaration winning, and every screen document reads all of them back.
/// </summary>
public sealed record SceneDeclarationSet(
    IReadOnlyList<LayoutSyntax> Layouts,
    IReadOnlyList<ScreenTemplateSyntax> ScreenTemplates,
    IReadOnlyList<DialogTemplateSyntax> DialogTemplates,
    IReadOnlyList<ExposureSyntax> Exposures,
    IReadOnlyList<InstanceContributionsSyntax> Instances)
{
    public static readonly SceneDeclarationSet Empty = new([], [], [], [], []);

    /// <summary>
    /// What the application and the module declare that a screen document has no member for, as Screenplay text.
    /// </summary>
    public string? Application { get; init; }

    public string? Module { get; init; }

    public bool IsEmpty => Layouts.Count == 0 && ScreenTemplates.Count == 0 && DialogTemplates.Count == 0 && Exposures.Count == 0 && Instances.Count == 0;

    /// <summary>
    /// The navigation regions of the application's layout and of its modules, which a document holds as its 'navigation' member.
    /// </summary>
    internal SceneNavigationDeclaration? Navigation { get; init; }

    /// <summary>
    /// How the features of documents stored before the board kept the levels of the outlets refine them, which a document holds as the 'feature' levels of its 'outletLevels'
    /// member. A feature's outlets are the board's now (StudioIssues#1327), so what an application says is not put in a document.
    /// </summary>
    internal IReadOnlyList<SceneFeatureOutlets> FeatureOutlets { get; init; } = [];

    public static SceneDeclarationSet Of(ApplicationSyntax application, ModuleSyntax? module) =>
        new(
            [.. application.Layouts ?? []],
            [.. module?.ScreenTemplates ?? []],
            [.. module?.DialogTemplates ?? []],
            [.. application.Exposures],
            [.. application.InstanceContributions])
        {
            Navigation = SceneNavigation.Of(application),
            Application = SceneNative.ApplicationResidue(application),
            Module = module is not null && ScreenplayImportScreenWarnings.HasTypedScreens(module)
                ? SceneNative.ModuleResidue(module, ScreenplayImportScreenWarnings.UnreachedForms(module))
                : null
        };

    public static SceneDeclarationSet Merge(IEnumerable<SceneDeclarationSet> sets)
    {
        var all = sets.ToArray();
        return new(
            [.. all.SelectMany(set => set.Layouts).DistinctBy(layout => layout.Name, StringComparer.Ordinal)],
            [.. all.SelectMany(set => set.ScreenTemplates).DistinctBy(template => template.Name, StringComparer.Ordinal)],
            [.. all.SelectMany(set => set.DialogTemplates).DistinctBy(template => template.Name, StringComparer.Ordinal)],
            [.. all.SelectMany(set => set.Exposures).DistinctBy(exposure => exposure.Owner, StringComparer.Ordinal)],
            [.. all.SelectMany(set => set.Instances).DistinctBy(instance => instance.Instance, StringComparer.Ordinal)])
        {
            Navigation = all.Select(set => set.Navigation).FirstOrDefault(navigation => navigation is not null),
            FeatureOutlets = [.. all.SelectMany(set => set.FeatureOutlets).DistinctBy(feature => feature.Feature, StringComparer.Ordinal)]
        };
    }

    /// <summary>
    /// The declarations as one role's Scene document holds them. The Studio screen layout is always there, because every
    /// screen the editor draws is drawn in it.
    /// </summary>
    public void WriteTo(JsonObject document, SceneScreenNames names, IEnumerable<string> screens)
    {
        var layouts = Layouts.Select(layout => (JsonNode)SceneTemplates.ToJson(layout)).ToList();
        if (!Layouts.Any(layout => layout.Name == SceneDocumentCanonicalForm.StudioLayoutName))
        {
            layouts.Insert(0, SceneDocumentCanonicalForm.StudioLayoutDeclaration());
        }

        var screenNames = screens.ToHashSet(StringComparer.Ordinal);
        var templates = ScreenTemplates.Select(template => template.Name).ToHashSet(StringComparer.Ordinal);
        var dialogs = DialogTemplates.Select(template => template.Name).ToHashSet(StringComparer.Ordinal);
        document["layouts"] = new JsonArray([.. layouts]);
        document["screenTemplates"] = new JsonArray([.. ScreenTemplates.Select(template => (JsonNode)SceneTemplates.ToJson(template))]);
        document["dialogTemplates"] = new JsonArray([.. DialogTemplates.Select(template => (JsonNode)SceneTemplates.ToJson(template))]);
        document["exposures"] = new JsonArray([.. Exposures.Select(exposure => (JsonNode)SceneExposures.ToJson(exposure))]);
        document["instanceContributions"] = new JsonArray([.. Instances.SelectMany(instance => SceneExposures.ToJson(instance, names, screenNames, templates, dialogs)).Cast<JsonNode>()]);
        if (Navigation is { IsEmpty: false } navigation)
        {
            document[SceneNavigation.Member] = SceneNavigation.ToJson(navigation);
        }

        if (FeatureOutlets.Count > 0)
        {
            SceneOutletLevels.Attach(document, SceneOutletLevels.Appended(document, FeatureOutlets, SceneNavigation.NavigationNames(Navigation?.Outlets ?? [])));
        }

        SceneNative.AttachResidue(document, this);
    }
}
