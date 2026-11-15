// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

public sealed record SceneDocumentScreenplayExport(
    IReadOnlyList<ScreenSyntax> Screens,
    IReadOnlyList<FormSyntax> Forms,
    IReadOnlyList<string> Diagnostics,
    bool IsTyped)
{
    public ScreenSyntax Screen => Screens[0];

    public SceneDeclarationSet Declarations { get; init; } = SceneDeclarationSet.Empty;

    /// <summary>
    /// What a stage can render: the typed screens without the preservation carrier, and no screen at all for a document that
    /// could only be carried. The diagnostics still name everything that was left out.
    /// </summary>
    public SceneDocumentScreenplayExport ForStage() => new(
        [.. Screens
            .Where(screen => screen.File is null || !SceneDocumentCarrier.IsCarrier(screen.File))
            .Select(screen => screen with { Directives = [.. screen.Directives.Where(directive => !SceneDocumentCarrier.IsCarrier(directive))] })],
        [.. Forms.Where(form => !SceneDocumentCarrier.IsCarrier(form))],
        Diagnostics,
        IsTyped)
    {
        Declarations = Declarations
    };
}

public sealed record SceneDocumentScreenplayDeclarations(
    IReadOnlyList<LayoutSyntax> Layouts,
    IReadOnlyList<UiProfileSyntax> UiProfiles,
    IReadOnlyList<ScreenTemplateSyntax> ScreenTemplates,
    IReadOnlyList<DialogTemplateSyntax> DialogTemplates,
    IReadOnlyList<string> Diagnostics)
{
    public IReadOnlyList<ExposureSyntax> Exposures { get; init; } = [];

    public IReadOnlyList<InstanceContributionsSyntax> Instances { get; init; } = [];

    public IReadOnlyList<ThemeSyntax> Themes { get; init; } = [];

    public IReadOnlyList<DesignSystemSyntax> DesignSystems { get; init; } = [];

    public IReadOnlyList<ConceptSyntax> Concepts { get; init; } = [];

    public IReadOnlyList<TypeSyntax> Types { get; init; } = [];

    public IReadOnlyList<SampleDataPackSyntax> SampleDataPacks { get; init; } = [];

    public IReadOnlyList<BehaviorSyntax> Behaviors { get; init; } = [];

    public IReadOnlyList<TemplateAssignmentSyntax> Templates { get; init; } = [];

    /// <summary>
    /// The navigation regions the documents state, for the application's layout and its modules to carry.
    /// </summary>
    internal SceneNavigationDeclaration? Navigation { get; init; }

    /// <summary>
    /// How the documents' features refine outlets, for the features of the application to carry.
    /// </summary>
    internal IReadOnlyList<SceneFeatureOutlets> FeatureOutlets { get; init; } = [];

    /// <summary>
    /// What the documents kept natively, for the modules to take their own from.
    /// </summary>
    internal NativeResidue Native { get; init; } = NativeResidue.Empty;
}

/// <summary>
/// A role's Scene document as typed Screenplay - one screen per Scene screen, named after the role, the module forms they
/// reach and the declarations the document brings - and back. A document holding something typed Screenplay 4.120 cannot
/// say travels on the preservation carrier instead, with a diagnostic naming each member that could not.
/// </summary>
public static class SceneDocumentScreenplayBridge
{
    public static SceneDocumentScreenplayExport Export(string screenName, string document) =>
        Export(screenName, string.Empty, document);

    public static SceneDocumentScreenplayExport Export(string screenName, string actorId, string document)
    {
        var role = ScreenplayIdentifier.From(screenName);
        var gaps = new SceneTransportGaps();

        // A document stored before Scene 5 is read in the slot shape (StudioIssues#1328), so it exports - and is preserved - as Screenplay 6.
        document = SceneDocumentUpgrade.Upgrade(document);
        if (SceneJson.Parse(document) is not { } root)
        {
            gaps.Add("Scene document is not a JSON object and cannot travel as typed Screenplay.");
            return Preserved(role, actorId, document, gaps);
        }

        // What typed Screenplay can say is proven by the round trip without what the document kept natively; that is added
        // to what the proof allowed, so the export says all of it.
        var (screens, forms, declarations) = SceneScreens.ToSyntax(role, root, gaps, includeNative: false);
        if (screens.Count == 0)
        {
            gaps.Add("Scene document has no screen to transport as typed Screenplay.");
            return Preserved(role, actorId, document, gaps);
        }

        if (!gaps.Any)
        {
            SceneTransportVerification.RoundTrip(role, SceneNative.Stripped(root), screens, forms, declarations, gaps, SceneNative.VerbatimNamesOf(root, SceneJson.Array(root, "screens").Select(screen => SceneJson.String(screen, "name") ?? string.Empty)) is not null);
        }

        if (!gaps.Any)
        {
            var (nativeScreens, nativeForms, nativeDeclarations) = SceneScreens.ToSyntax(role, root, new SceneTransportGaps());
            return new(nativeScreens, nativeForms, [], true) { Declarations = nativeDeclarations };
        }

        // The typed part still reaches the stage when it compiles - with the document's declarations if they compile too.
        if (SceneTransportVerification.Compiles(screens, forms, declarations, new SceneTransportGaps()))
        {
            var (nativeScreens, nativeForms, nativeDeclarations) = SceneScreens.ToSyntax(role, root, new SceneTransportGaps());
            return Carried(nativeScreens, nativeForms, actorId, document, gaps) with { Declarations = nativeDeclarations };
        }

        if (SceneTransportVerification.Compiles(screens, forms, SceneDeclarationSet.Empty, new SceneTransportGaps()))
        {
            var (nativeScreens, nativeForms, _) = SceneScreens.ToSyntax(role, root, new SceneTransportGaps());
            return Carried(nativeScreens, nativeForms, actorId, document, gaps);
        }

        return Preserved(role, actorId, document, gaps);
    }

    /// <summary>
    /// The ui profiles the documents name, and the layouts, templates, exposures and instance contributions their exports
    /// declare - merged once for the application, the way Screenplay declares them.
    /// </summary>
    public static SceneDocumentScreenplayDeclarations Declarations(IEnumerable<string> documents, IEnumerable<SceneDocumentScreenplayExport> exports)
    {
        var all = documents.Select(SceneDocumentUpgrade.Upgrade).ToArray();
        var merged = SceneDeclarationSet.Merge(exports.Select(export => export.Declarations));
        var profiles = SceneDeclarations.Profiles(all);
        var native = SceneNative.ResidueOf(all.Select(SceneJson.Parse).OfType<JsonObject>());
        return new(
            [.. merged.Layouts.Select(native.Restore)],
            [.. profiles.Profiles, .. native.UiProfiles.Where(profile => profiles.Profiles.All(known => known.Name != profile.Name))],
            [.. merged.ScreenTemplates.Select(native.Restore)],
            [.. merged.DialogTemplates.Select(native.Restore)],
            profiles.Diagnostics)
        {
            Exposures = merged.Exposures,
            Instances = merged.Instances,
            Themes = native.Themes,
            DesignSystems = native.DesignSystems,
            Concepts = native.Concepts,
            Types = native.Types,
            SampleDataPacks = native.SampleDataPacks,
            Behaviors = native.Behaviors,
            Templates = native.Templates,
            Navigation = merged.Navigation,
            FeatureOutlets = merged.FeatureOutlets,
            Native = native
        };
    }

    /// <summary>
    /// The composite types the documents keep natively for the application - the ones Declarations hands an export.
    /// </summary>
    public static IReadOnlyList<TypeSyntax> Types(IEnumerable<string> documents) =>
        SceneNative.ResidueOf(documents.Select(SceneJson.Parse).OfType<JsonObject>()).Types;

    public static string? TryImport(ScreenSyntax screen) =>
        TryImport(Guid.Empty, screen, [])?.Document;

    public static ImportedScreenDocument? TryImport(Guid sliceId, ScreenSyntax screen, IEnumerable<FormSyntax> forms) =>
        TryImport(sliceId, [screen], forms) is [var first, ..] ? first : null;

    public static IReadOnlyList<ImportedScreenDocument> TryImport(Guid sliceId, IEnumerable<ScreenSyntax> screens, IEnumerable<FormSyntax> forms) =>
        TryImport(sliceId, screens, forms, SceneDeclarationSet.Empty, []);

    /// <summary>
    /// The screens of a slice, read back as one Scene document per role: a role's screens are the ones named after it, and
    /// every document holds the declarations of the application it is in.
    /// </summary>
    public static IReadOnlyList<ImportedScreenDocument> TryImport(Guid sliceId, IEnumerable<ScreenSyntax> screens, IEnumerable<FormSyntax> forms, SceneDeclarationSet declarations, IEnumerable<string> allScreens, string? sliceResidue = null, IReadOnlySet<string>? roles = null)
    {
        var applicationScreens = allScreens.ToArray();
        var moduleForms = forms.ToArray();
        List<ImportedScreenDocument> documents = [];

        // A document that declares personas says who the roles are: a screen is a role's when it is named after one. Every other screen is a screen of its own,
        // written under the name it has, and belongs to the slice rather than to a role - so it does not make a row of an actor the document never declared.
        // A document that declares none keeps what it always meant: a screen is named after its role.
        var ownScreens = roles is null ? [] : screens.Where(screen => !roles.Contains(SceneScreenNames.RoleOf(screen.Name))).ToArray();
        var roleScreens = roles is null ? screens : screens.Except(ownScreens);

        foreach (var role in roleScreens.GroupBy(screen => SceneScreenNames.RoleOf(screen.Name), StringComparer.Ordinal))
        {
            Add(role.Key, [.. role], verbatim: false);
        }

        if (ownScreens.Length > 0)
        {
            Add(null, ownScreens, verbatim: true);
        }

        return documents;

        void Add(string? role, ScreenSyntax[] group, bool verbatim)
        {
            var preserved = group.Select(screen => SceneDocumentCarrier.TryImport(sliceId, screen, moduleForms)).FirstOrDefault(document => document is not null);
            if (preserved is not null)
            {
                documents.Add(preserved);
                return;
            }

            var typed = group.Where(screen => screen.Directives.Any()).ToArray();
            if (typed.Length > 0)
            {
                var document = SceneScreens.ToJson(role ?? string.Empty, typed, moduleForms.Where(form => !SceneDocumentCarrier.IsCarrier(form)), declarations, applicationScreens, verbatim);
                SceneNative.AttachSlice(document, sliceResidue);
                documents.Add(new(sliceId, null, document.ToJsonString(SceneJson.Options)) { RoleName = role });
            }
        }
    }

    public static SceneDocumentScreenplayExport Preserve(string screenName, string actorId, string document, string diagnostic)
    {
        var gaps = new SceneTransportGaps();
        gaps.Add(diagnostic);
        return Preserved(ScreenplayIdentifier.From(screenName), actorId, document, gaps);
    }

    public static SceneDocumentScreenplayExport Carry(SceneDocumentScreenplayExport export, string actorId, string document, string diagnostic)
    {
        var gaps = new SceneTransportGaps();
        gaps.Add(diagnostic);
        return Carried(export.Screens, export.Forms, actorId, document, gaps) with { Declarations = export.Declarations };
    }

    /// <summary>
    /// What typed Screenplay can say still reaches the stage, and the exact document rides beside it.
    /// </summary>
    static SceneDocumentScreenplayExport Carried(IReadOnlyList<ScreenSyntax> screens, IReadOnlyList<FormSyntax> forms, string actorId, string document, SceneTransportGaps gaps)
    {
        var primary = screens[0] with { Directives = [.. screens[0].Directives, SceneDocumentCarrier.Directive(actorId, document)] };
        return new([primary, .. screens.Skip(1)], forms, gaps.Messages, true);
    }

    static SceneDocumentScreenplayExport Preserved(string role, string actorId, string document, SceneTransportGaps gaps) =>
        new([ScreenplaySceneDocumentReferences.ToScreen(role, document)], [SceneDocumentCarrier.Form(role, actorId, document)], gaps.Messages, false);
}
