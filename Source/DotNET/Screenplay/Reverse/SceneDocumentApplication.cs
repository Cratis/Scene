// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Printing;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// What a set of Scene documents print as: the Screenplay source, the application it is, and what could not be said.
/// </summary>
/// <param name="Source">The Screenplay source; empty when the application cannot be written.</param>
/// <param name="Application">The application the documents became.</param>
/// <param name="Warnings">What the documents hold that Screenplay cannot say, and what could not be written.</param>
public sealed record SceneDocumentApplicationPrint(string Source, ApplicationSyntax Application, IReadOnlyList<string> Warnings);

/// <summary>
/// Scene documents as one Screenplay application, and back - the bridge for a host that holds role documents and no board.
/// </summary>
/// <remarks>
/// A host that has an event model (Studio) assembles the application itself from the pieces of the bridge. A host that holds
/// only the documents - a Scene editor, Scene Design, a test - uses this: every role's screens become the screens of one slice,
/// and the declarations the documents bring (layouts, templates, profiles, themes, design systems, behaviors, sample data,
/// exposures, navigation, outlet refinements) are declared once for the application, the way Screenplay declares them.
/// </remarks>
public static class SceneDocumentApplication
{
    const string ModuleName = "Screens";

    static readonly ScreenplayPrinter _printer = new();

    static readonly Lazy<ArrangementSyntax?> _editorScreenArrangement = new(() =>
        new ScreenplayCompiler().Parse($"layout {SceneDocumentCanonicalForm.StudioLayoutName}\n  content\n\n  arrangement flow\n    column\n      content grow\n").Value?.Layouts?.SingleOrDefault()?.Arrangement);

    /// <summary>
    /// Prints a set of role documents as one Screenplay application.
    /// </summary>
    /// <param name="documents">The role documents to print.</param>
    /// <param name="forStage">Whether the application is for a stage that runs it, which leaves out what only the document carries.</param>
    /// <returns>The <see cref="SceneDocumentApplicationPrint"/>.</returns>
    public static SceneDocumentApplicationPrint Print(IEnumerable<SceneModuleDocument> documents, bool forStage = false)
    {
        var extracted = documents.Select(document => (Document: document, Free: SceneFreeScreens.Extract(document.Document))).ToArray();
        var free = FreeScreenDeclarations.Merge(extracted.Select(entry => entry.Free.Free));
        var all = extracted.Select(entry => entry.Document with { Document = entry.Free.Document }).Where(document => HasScreens(document.Document) || extracted.Length == 1).ToArray();
        var exports = SceneModuleExports.ForApplication(forStage, all);
        var declarations = SceneDocumentScreenplayBridge.Declarations(all.Select(document => document.Document), exports.Values);
        var warnings = new ScreenplayExportWarnings();
        foreach (var diagnostic in declarations.Diagnostics)
        {
            warnings.Add($"Scene declarations: {diagnostic}");
        }

        foreach (var diagnostic in exports.Values.SelectMany(export => export.Diagnostics))
        {
            warnings.Add(diagnostic);
        }

        var screens = exports.Values.SelectMany(export => export.Screens).ToArray();
        var forms = SceneModuleExports.Forms(exports.Values).ToArray();
        FeatureSyntax[] features = screens.Length == 0
            ? []
            : [new FeatureSyntax(ModuleName, [], [new SliceSyntax(Cratis.Screenplay.Syntax.SliceType.StateView, ModuleName, [], [], [], [], [], [], screens, [], [], SourceLocation.Start)], SourceLocation.Start)];
        List<ModuleSyntax> modules = [new ModuleSyntax(ModuleName, declarations.ScreenTemplates, features, SourceLocation.Start, Forms: forms, DialogTemplates: declarations.DialogTemplates)];
        foreach (var diagnostic in free.Diagnostics)
        {
            warnings.Add($"Free screens: {diagnostic}");
        }

        modules = SceneFreeScreens.OnApplication(free, modules, out var applicationScreens, out var shapes);
        var layouts = ShellLayouts(declarations, forStage);

        modules = WithNavigationTargets(declarations.Navigation, modules);
        (layouts, modules) = SceneNavigation.OnApplication(declarations.Navigation, layouts, modules, warnings);
        modules = SceneOutletLevels.ApplyTo(declarations.FeatureOutlets, layouts, modules, warnings);

        var application = new ApplicationSyntax(
            [],
            declarations.Concepts,
            [],
            modules,
            SourceLocation.Start,
            UiProfiles: declarations.UiProfiles.Count > 0 ? WithPanelPackage(declarations.UiProfiles, exports.Values, declarations) : null,
            Themes: NonEmpty(declarations.Themes),
            Layouts: NonEmpty(layouts))
        {
            Behaviors = declarations.Behaviors,
            DesignSystems = declarations.DesignSystems,
            Types = declarations.Types,
            Shapes = shapes,
            Screens = applicationScreens,
            SampleDataPacks = declarations.SampleDataPacks,
            Templates = declarations.Templates,
            Exposures = declarations.Exposures,
            InstanceContributions = declarations.Instances
        };

        try
        {
            return new(_printer.Print(application), application, warnings.All);
        }
        catch (UnsupportedSyntaxForPrinting unsupported)
        {
            return new(string.Empty, application, [.. warnings.All, $"The Screenplay of the application cannot be written: {unsupported.Message}"]);
        }
    }

    /// <summary>
    /// Reads the Scene documents a Screenplay application holds: one per role, with the declarations of the application it sits in.
    /// </summary>
    /// <param name="application">The compiled application.</param>
    /// <returns>The documents; a typed role's screens are rebuilt as Scene, a preserved role's arrive exactly.</returns>
    public static IReadOnlyList<ImportedScreenDocument> Read(ApplicationSyntax application)
    {
        // The roles of the document are the personas it declares; a document that declares none leaves every screen name to be a role.
        IReadOnlySet<string>? roles = (application.Personas ?? []).Any()
            ? (application.Personas ?? []).Select(persona => ScreenplayIdentifier.From(persona.Name)).ToHashSet(StringComparer.Ordinal)
            : null;
        var allScreens = application.Modules.SelectMany(module => Features(module.Features)).SelectMany(feature => feature.Slices).SelectMany(slice => slice.Screens).Select(screen => screen.Name).ToArray();
        List<ImportedScreenDocument> documents = [];
        if (SceneFreeScreens.Read(application) is { } freeScreens)
        {
            documents.Add(freeScreens);
        }

        foreach (var module in application.Modules)
        {
            var forms = module.Forms ?? [];
            var declarations = SceneDeclarationSet.Of(application, module);
            foreach (var slice in Features(module.Features).SelectMany(feature => feature.Slices))
            {
                documents.AddRange(SceneDocumentScreenplayBridge.TryImport(Guid.Empty, slice.Screens, forms, declarations, allScreens, SceneNative.SliceResidue(slice), roles));
            }
        }

        return documents;
    }

    /// <summary>
    /// The layouts the application declares: the editor's own screen layout does not come before one the model declared.
    /// </summary>
    /// <remarks>
    /// The navigation goes on the first layout, and a stage places every screen on it, so the editor's own screen layout - only the slot a
    /// screen's content goes in - is declared on its own only when the model has none, and then not for a stage: it would draw an unresolved component.
    /// </remarks>
    static LayoutSyntax[] ShellLayouts(SceneDocumentScreenplayDeclarations declarations, bool forStage)
    {
        var authored = declarations.Layouts.Where(layout => !IsEditorsOwnScreenLayout(layout)).ToArray();
        var shells = authored.Length == 0 && !forStage ? [.. declarations.Layouts] : authored;
        return [.. shells.Select(WithEditorsArrangement)];
    }

    static LayoutSyntax WithEditorsArrangement(LayoutSyntax layout) =>
        layout.Name == SceneDocumentCanonicalForm.StudioLayoutName && layout.Arrangement is null
            ? layout with { Arrangement = _editorScreenArrangement.Value }
            : layout;

    /// <summary>
    /// The editor's screen layout - one content slot, nothing arranged, nothing attached. One the model gave an arrangement, behaviors,
    /// contribution points or exposed values of its own is the model's layout, kept as it was.
    /// </summary>
    static bool IsEditorsOwnScreenLayout(LayoutSyntax layout) =>
        layout.Name == SceneDocumentCanonicalForm.StudioLayoutName
        && layout.Arrangement is null
        && !layout.Behaviors.Any() && !layout.UsedBehaviors.Any() && !layout.Exposes.Any() && !layout.Outlets.Any()
        && layout.Slots.Count() == 1 && layout.Slots.Single() is { Role: null, Routed: false, Primary: false, Optional: false } slot && string.Equals(slot.Name, "content", StringComparison.Ordinal);

    /// <summary>
    /// Declares - empty - each module and feature the navigation names that the documents' screens do not make, so what points at it compiles.
    /// </summary>
    static List<ModuleSyntax> WithNavigationTargets(SceneNavigationDeclaration? navigation, List<ModuleSyntax> modules)
    {
        if (navigation is null)
        {
            return modules;
        }

        var targets = navigation.Outlets.Concat(navigation.Modules.SelectMany(module => module.Outlets))
            .SelectMany(outlet => outlet.Items.SelectMany(item => TargetsOf(item)))
            .Concat(navigation.Modules.Select(module => new NavigationTargetSyntax(module.Module, null, SourceLocation.Start)));
        foreach (var target in targets)
        {
            var index = modules.FindIndex(module => module.Name == target.Module);
            if (index < 0)
            {
                modules.Add(new ModuleSyntax(target.Module, [], [], SourceLocation.Start));
                index = modules.Count - 1;
            }

            if (target.Feature is { Length: > 0 } feature)
            {
                modules[index] = modules[index] with { Features = Declared(modules[index].Features, feature.Split('.')) };
            }
        }

        return modules;

        static IEnumerable<NavigationTargetSyntax> TargetsOf(OutletItemSyntax item) =>
            item is NavigationItemSyntax navigationItem
                ? (navigationItem.Target is { } target ? [target] : Enumerable.Empty<NavigationTargetSyntax>()).Concat(navigationItem.Children.SelectMany(child => TargetsOf(child)))
                : [];

        static IReadOnlyList<FeatureSyntax> Declared(IEnumerable<FeatureSyntax> features, string[] path)
        {
            var existing = features.FirstOrDefault(feature => feature.Name == path[0]);
            var declared = existing ?? new FeatureSyntax(path[0], [], [], SourceLocation.Start);
            if (path.Length > 1)
            {
                declared = declared with { Features = Declared(declared.Features, path[1..]) };
            }

            return existing is null ? [.. features.Append(declared)] : [.. features.Select(feature => ReferenceEquals(feature, existing) ? declared : feature)];
        }
    }

    static bool HasScreens(string document) =>
        SceneJson.Parse(document) is { } root && SceneJson.Array(root, "screens").Count > 0;

    static IEnumerable<FeatureSyntax> Features(IEnumerable<FeatureSyntax> features) =>
        features.SelectMany(feature => new[] { feature }.Concat(Features(feature.Features)));

    static IReadOnlyList<T>? NonEmpty<T>(IReadOnlyList<T> items) => items.Count > 0 ? items : null;

    /// <summary>
    /// Widens a profile that lists packages with the one a panel is written as, which Screenplay requires of every profile once any lists one.
    /// </summary>
    static IReadOnlyList<UiProfileSyntax> WithPanelPackage(IReadOnlyList<UiProfileSyntax> profiles, IEnumerable<SceneDocumentScreenplayExport> exports, SceneDocumentScreenplayDeclarations declarations)
    {
        var panelUsed = exports.SelectMany(export => export.Screens).Any(screen => SceneNative.Uses(screen, SceneElementFrame.PanelComponent))
            || declarations.ScreenTemplates.Any(template => template.Content.Any(content => SceneNative.Uses(content.Directives, SceneElementFrame.PanelComponent)))
            || declarations.DialogTemplates.Any(template => template.Content.Any(content => SceneNative.Uses(content.Directives, SceneElementFrame.PanelComponent)));
        return panelUsed
            ? [.. profiles.Select(profile => profile.Packages.Any() && !profile.Packages.Contains(SceneElementFrame.PanelComponent) ? profile with { Packages = [.. profile.Packages, SceneElementFrame.PanelComponent] } : profile)]
            : profiles;
    }
}
