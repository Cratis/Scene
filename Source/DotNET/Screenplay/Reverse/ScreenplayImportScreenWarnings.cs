// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The UI a document states that the import cannot turn into a screen document. A role's screens arrive as one Scene
/// document: a preserved carrier arrives exactly, while typed screens are rebuilt from components, sections, actions,
/// behaviors, one template reference and contributions of one component each, and every typed document holds the layouts,
/// templates, exposures and instance contributions the application declares. Anything else on a typed screen, a form no
/// imported screen reaches, declarations no screen document takes, and the rest of the UI declarations is named here,
/// because the rebuild otherwise drops it without a word.
/// </summary>
public static class ScreenplayImportScreenWarnings
{
    const string StudioScreenLayout = SceneDocumentCanonicalForm.StudioLayoutName;

    static readonly string[] _knownSizeClasses = ["compact", "regular", "expanded"];

    public static IEnumerable<Diagnostic> For(ApplicationSyntax application)
    {
        var anyTyped = application.Modules.Any(module => TypedScreensOf(module).Any());
        return ForDeclarations(application, anyTyped)
            .Concat(ForInstances(application))
            .Concat(application.Modules.SelectMany(ForModule));
    }

    /// <summary>
    /// Whether any screen of the module is rebuilt as typed Scene - the module's declarations then travel with it.
    /// </summary>
    internal static bool HasTypedScreens(ModuleSyntax module) => TypedScreensOf(module).Any();

    /// <summary>
    /// The module forms no typed screen takes with it: no imported screen has an action for the command they are for.
    /// </summary>
    internal static IReadOnlyList<FormSyntax> UnreachedForms(ModuleSyntax module)
    {
        var reached = TypedScreensOf(module).SelectMany(ReachedCommands).ToHashSet(StringComparer.Ordinal);
        return [.. (module.Forms ?? []).Where(form => !SceneDocumentCarrier.IsCarrier(form) && !reached.Contains(form.For))];
    }

    /// <summary>
    /// A typed screen document carries everything the application and its module declare in the native member of the document
    /// (see SceneNative), so what is left behind is only what no screen document exists to carry.
    /// </summary>
    static IEnumerable<Diagnostic> ForDeclarations(ApplicationSyntax application, bool anyTyped)
    {
        if (anyTyped)
        {
            return [];
        }

        List<string> declarations =
        [
            .. application.UiProfiles?.Any(profile => !OnlyChoosesWhatTheImportCarries(profile)) == true ? new[] { "ui profiles" } : [],
            .. application.Themes?.Any() == true ? new[] { "themes" } : [],
            .. application.DesignSystems.Any() ? new[] { "design systems" } : [],
            .. application.Behaviors.Any() ? new[] { "behaviors" } : [],
            .. application.Templates.Any() ? new[] { "template assignments" } : []
        ];

        // Layouts, navigation, exposures and instance contributions travel inside the screen documents, so they are only left behind
        // when the import produces none.
        List<string> undelivered =
        [
            .. application.Layouts?.Any(layout => layout.Name != StudioScreenLayout) == true ? new[] { "layouts" } : [],
            .. application.Exposures.Any() ? new[] { "exposures" } : [],
            .. application.InstanceContributions.Any() ? new[] { "instance contributions" } : [],
            .. SceneNavigation.Of(application) is not null ? new[] { "navigation" } : []
        ];

        if (!anyTyped)
        {
            declarations.AddRange(undelivered);
        }

        return
        [
            .. declarations.Count == 0
                ? []
                : new[]
                {
                    Diagnostic.Warning(
                        ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried,
                        $"The document declares {string.Join(", ", declarations)} at the application level, and the import does not add them as declarations - a screen document keeps only what it carries itself{(anyTyped ? string.Empty : ", and no screen here becomes a screen document")}.",
                        application.Location)
                },
            .. (application.Layouts ?? []).SelectMany(layout => ForDeclaration($"layout {layout.Name}", layout.Arrangement, layout.Behaviors.Any() || layout.UsedBehaviors.Any(), layout.Exposes.Any(), [], layout.Location))
        ];
    }

    /// <summary>
    /// The sample data packs and the pack a ui profile chooses, and the root template, appearance and default template of the profile
    /// (ScreenplayUiProfile, with the legacy `layout` line read as the root template), are the application's own: the import saves
    /// them, with or without a screen document. A profile that says nothing but those is therefore delivered, and does not count as a
    /// declaration the import leaves behind. The packages such a profile lists are those Screenplay requires it to list for the blueprints
    /// its templates come from; the application's own packages are chosen in the designer.
    /// </summary>
    static bool OnlyChoosesWhatTheImportCarries(UiProfileSyntax profile) =>
        (profile.SampleData is not null || profile.Root is not null || profile.Appearance is not null || profile.NewScreenTemplate is not null || profile.DefaultSizeClass is { Length: > 0 } || profile.Layout is { Length: > 0 })
        && profile.Packages.All(package => profile.Root?.Blueprint == package || profile.NewScreenTemplate?.Blueprint == package)
        && !profile.Icons.Any()
        && profile.Theme is null
        && (profile.DefaultSizeClass is null || _knownSizeClasses.Contains(profile.DefaultSizeClass, StringComparer.OrdinalIgnoreCase))
        && profile.Platforms.All(platform => string.Equals(platform, "web", StringComparison.Ordinal));

    /// <summary>
    /// An instance contribution reaches a screen document when it names one of the application's screens, screen
    /// templates or dialog templates.
    /// </summary>
    static IEnumerable<Diagnostic> ForInstances(ApplicationSyntax application)
    {
        var known = application.Modules
            .SelectMany(module => Features(module.Features).SelectMany(feature => feature.Slices).SelectMany(slice => slice.Screens).Select(screen => screen.Name)
                .Concat(module.ScreenTemplates.Select(template => template.Name))
                .Concat((module.DialogTemplates ?? []).Select(template => template.Name)))
            .ToHashSet(StringComparer.Ordinal);

        return application.InstanceContributions
            .Where(instance => !known.Contains(instance.Instance))
            .Select(instance => Diagnostic.Warning(
                ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried,
                $"instance {instance.Instance}: its contributions were not added to any screen document - it names no screen, screen template or dialog template.",
                instance.Location));
    }

    static IEnumerable<Diagnostic> ForModule(ModuleSyntax module)
    {
        var typedScreens = TypedScreensOf(module).ToArray();
        if (typedScreens.Length > 0)
        {
            return [];
        }

        var reached = typedScreens.SelectMany(ReachedCommands).ToHashSet(StringComparer.Ordinal);
        var unreachedForms = (module.Forms ?? []).Where(form => !SceneDocumentCarrier.IsCarrier(form) && !reached.Contains(form.For)).ToArray();
        var dialogTemplates = module.DialogTemplates ?? [];

        List<string> declarations =
        [
            .. typedScreens.Length == 0 && module.ScreenTemplates.Any() ? new[] { "screen templates" } : [],
            .. typedScreens.Length == 0 && dialogTemplates.Any() ? new[] { "dialog templates" } : [],
            .. module.Contributions?.Any() == true ? new[] { "contributions" } : [],
            .. module.Behaviors.Any() || module.UsedBehaviors.Any() ? new[] { "behaviors" } : []
        ];

        return
        [
            .. declarations.Count == 0
                ? []
                : new[]
                {
                    Diagnostic.Warning(
                        ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried,
                        $"module {module.Name}: the document declares {string.Join(", ", declarations)} here, and the import does not add them as declarations - a screen document keeps only what it carries itself.",
                        module.Location)
                },
            .. unreachedForms.Select(form => Diagnostic.Warning(
                ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried,
                $"module {module.Name}: form {form.Name} for command {form.For} was not added to any screen document - no imported screen has an action for that command, and a form travels with the screen that uses it.",
                form.Location)),
            .. module.ScreenTemplates.SelectMany(template => ForDeclaration($"module {module.Name}, screen template {template.Name}", template.Arrangement, template.Behaviors.Any() || template.UsedBehaviors.Any(), template.Exposes.Any(), template.Content, template.Location)),
            .. dialogTemplates.SelectMany(template => ForDeclaration($"module {module.Name}, dialog template {template.Name}", template.Arrangement, template.Behaviors.Any() || template.UsedBehaviors.Any(), template.Exposes.Any(), template.Content, template.Location)),
            .. typedScreens.SelectMany(screen => ForScreen(module.Name, screen))
        ];
    }

    /// <summary>
    /// What a layout or template declaration says beyond its slots, metadata, outlets, display text and slot content.
    /// </summary>
    static IEnumerable<Diagnostic> ForDeclaration(string owner, ArrangementSyntax? arrangement, bool behaviors, bool exposes, IEnumerable<TemplateSlotContentSyntax> content, SourceLocation location)
    {
        List<string> dropped =
        [
            .. arrangement is null ? [] : new[] { "an arrangement" },
            .. behaviors ? new[] { "behaviors" } : [],
            .. exposes ? new[] { "exposed values" } : []
        ];
        dropped.AddRange(Described(content.SelectMany(slot => NotCarried(slot.Directives, topLevel: false))).Select(kind => kind + " in its content"));

        return dropped.Count == 0
            ? []
            :
            [
                Diagnostic.Warning(
                    ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried,
                    $"{owner}: {string.Join(", ", dropped)} declared here {(dropped.Count == 1 ? "was" : "were")} not added to the screen documents - a declaration keeps its slots, metadata, outlets, display text and slot content.",
                    location)
            ];
    }

    static IEnumerable<Diagnostic> ForScreen(string module, ScreenSyntax screen)
    {
        var names = SceneScreenNames.ForScreenplay(SceneScreenNames.RoleOf(screen.Name), [screen.Name]);
        var contributions = screen.Contributions
            .Where(contribution => NotCarried(contribution.Directives, topLevel: false).Any() || SceneElementImport.ToElements(contribution.Directives, names).Count != 1)
            .Select(contribution => $"a contribution to {contribution.ContributionPoint}");
        var dropped = Described(NotCarried(screen.Directives, topLevel: true)).Concat(contributions).ToArray();

        return dropped.Length == 0
            ? []
            :
            [
                Diagnostic.Warning(
                    ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried,
                    $"module {module}, screen {screen.Name}: {string.Join(", ", dropped)} declared here {(dropped.Length == 1 ? "was" : "were")} not added to the screen document - a screen document is built from components, sections, actions, behaviors, one template reference and contributions of one component each.",
                    screen.Location)
            ];
    }

    static IEnumerable<string> Described(IEnumerable<ScreenDirectiveSyntax> directives) =>
        directives
            .GroupBy(Kind, StringComparer.Ordinal)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => group.Count() == 1 ? $"a {group.Key}" : $"{group.Count()} {group.Key}s");

    /// <summary>
    /// Mirrors what the import reads: components (through their slots), sections, actions and behaviors anywhere,
    /// and the first template reference on the screen itself (through its slots). Everything else is left behind.
    /// </summary>
    static IEnumerable<ScreenDirectiveSyntax> NotCarried(IEnumerable<ScreenDirectiveSyntax> directives, bool topLevel)
    {
        var templateTaken = false;
        foreach (var directive in directives)
        {
            switch (directive)
            {
                case ScreenComponentSyntax component:
                    foreach (var nested in NotCarried(component.Slots.SelectMany(slot => slot.Directives), topLevel: false))
                    {
                        yield return nested;
                    }

                    break;

                case ScreenSectionSyntax section:
                    foreach (var nested in NotCarried(section.Directives, topLevel: false))
                    {
                        yield return nested;
                    }

                    break;

                case ScreenTemplateReferenceSyntax template when topLevel && !templateTaken:
                    templateTaken = true;
                    foreach (var nested in NotCarried(template.Slots.SelectMany(slot => slot.Directives), topLevel: false))
                    {
                        yield return nested;
                    }

                    break;

                case ScreenActionSyntax:
                case ScreenBehaviorSyntax:
                    break;

                default:
                    yield return directive;
                    break;
            }
        }
    }

    /// <summary>
    /// A role's screens arrive exactly when one of them is a preserved carrier; otherwise every screen with content
    /// is rebuilt as typed Scene, which is where things can be left behind.
    /// </summary>
    static IEnumerable<ScreenSyntax> TypedScreensOf(ModuleSyntax module) =>
        Features(module.Features).SelectMany(feature => feature.Slices).SelectMany(slice => TypedScreens(slice.Screens));

    static IEnumerable<ScreenSyntax> TypedScreens(IEnumerable<ScreenSyntax> screens) =>
        screens
            .GroupBy(screen => SceneScreenNames.RoleOf(screen.Name), StringComparer.Ordinal)
            .Where(role => !role.Any(screen => screen.Directives.Any(SceneDocumentCarrier.IsCarrier)))
            .SelectMany(role => role.Where(screen => screen.Directives.Any()));

    /// <summary>
    /// The forms a typed screen takes with it are the ones for the actions on the screen itself, or in the slots of
    /// its template.
    /// </summary>
    static IEnumerable<string> ReachedCommands(ScreenSyntax screen)
    {
        var template = screen.Directives.OfType<ScreenTemplateReferenceSyntax>().FirstOrDefault();
        var directives = template?.Slots.SelectMany(slot => slot.Directives) ?? screen.Directives;
        return directives.OfType<ScreenActionSyntax>().Select(action => action.Command);
    }

    static IEnumerable<FeatureSyntax> Features(IEnumerable<FeatureSyntax> features) =>
        features.SelectMany(feature => new[] { feature }.Concat(Features(feature.Features)));

    static string Kind(ScreenDirectiveSyntax directive)
    {
        var name = directive.GetType().Name;
        name = name.StartsWith("Screen", StringComparison.Ordinal) ? name["Screen".Length..] : name;
        name = name.EndsWith("Syntax", StringComparison.Ordinal) ? name[..^"Syntax".Length] : name;
        return string.Concat(name.Select((character, index) =>
            char.IsUpper(character) ? (index == 0 ? string.Empty : " ") + char.ToLowerInvariant(character) : character.ToString()));
    }
}
