// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.Json.Nodes;
using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Engine.Shell;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Packages;
using Cratis.Scene.Model.Profiles;
using Cratis.Scene.Model.Screens;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Finds everything that stops a profile from being applied. The one place these rules live (REN2); Studio presents the result. The TypeScript twin is
/// <c language="csharp">findProfileBlockers</c>; both are asserted against the shared <c language="csharp">profile-blockers-fixtures.json</c> corpus.
/// </summary>
/// <remarks>
/// The first group is the profile itself: dependencies that cannot be met, a shell that cannot be the shell, a theme the packages cannot use, a default
/// screen template nothing provides. The second is the profile's effect on what exists: every layout, template and slot an authored screen uses must
/// still be supplied. Nothing is replaced or dropped silently - an unsatisfied use is a blocker the user resolves first. Every message names what it is
/// about; none shows an id or a placeholder.
/// </remarks>
public static class ProfileBlockers
{
    static readonly HashSet<ShellDiagnosticCode> _unusableShell =
    [
        ShellDiagnosticCode.RootTemplateUnknown,
        ShellDiagnosticCode.RootTemplateVersionNotSatisfied,
        ShellDiagnosticCode.RootTemplateNotApplicable,
        ShellDiagnosticCode.RootTemplateMissingContentSlot,
        ShellDiagnosticCode.RootTemplateCycle
    ];

    /// <summary>
    /// Finds the blockers of a profile.
    /// </summary>
    /// <param name="profile">The profile that would be applied.</param>
    /// <param name="context">What it is checked against.</param>
    /// <returns>The blockers, empty when the profile can be applied.</returns>
    public static IReadOnlyList<ProfileBlocker> Find(UiProfile profile, ProfileBlockerContext context)
    {
        var vocabulary = Vocabulary.Of(profile, context.Library);
        ProfileBlocker[] blockers =
        [
            .. DependencyBlockers(profile, context),
            .. ShellBlockers(context),
            .. ThemeBlockers(profile, context),
            .. DefaultTemplateBlockers(profile, vocabulary),
            .. (context.Usages ?? []).SelectMany(usage => UsageBlockers(profile.Name, usage, vocabulary))
        ];

        return [.. blockers.Select(blocker => blocker with { Severity = ProblemSeverity.Blocker, Section = SectionOf(blocker.Code) })];
    }

    /// <summary>
    /// Finds everything worth telling the author about a profile: the blockers first, then the warnings and information the profile can be applied with.
    /// Removing a package never changes the theme: a theme that needed the package becomes <see cref="ProfileBlockerCode.ThemeNeedsPackage"/>.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="context">What it is checked against.</param>
    /// <returns>The problems, blockers first.</returns>
    public static IReadOnlyList<ProfileBlocker> FindProblems(UiProfile profile, ProfileBlockerContext context)
    {
        ProfileBlocker?[] advisories =
        [
            ThemeNeedsPackage(profile, context),
            AccentTooLight(profile),
            OwnShellHasNoValue(profile),
            LogoImageMissing(profile),
            RevealNeedsHover(profile)
        ];

        return [.. Find(profile, context), .. advisories.OfType<ProfileBlocker>()];
    }

    /// <summary>
    /// Applies a problem's fix. One function for every host, so the same fix gives the same profile in C# and TypeScript.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="fix">The fix.</param>
    /// <param name="catalog">Every package that could be selected.</param>
    /// <returns>The profile after the fix.</returns>
    public static UiProfile ApplyFix(UiProfile profile, ProfileFix fix, IReadOnlyList<ScenePackage> catalog) => fix.Kind switch
    {
        ProfileFixKind.AddPackage => fix.Package is null ? profile : PackageList.Add(profile, catalog, fix.Package).Profile,
        ProfileFixKind.UseThemeAccent => profile.Appearance is null ? profile : profile with { Appearance = profile.Appearance with { Accent = null } },
        ProfileFixKind.UseDefaultBlueprint => profile with { Root = null },
        ProfileFixKind.UseInitials => UseInitials(profile),
        ProfileFixKind.SwitchToDrawer => SwitchToDrawer(profile),
        _ => profile
    };

    static IEnumerable<ProfileBlocker> DependencyBlockers(UiProfile profile, ProfileBlockerContext context)
    {
        var selection = PackageDependencyResolver.Resolve(profile.Packages, context.Packages);
        return
        [
            .. selection.Missing.Select(missing => new ProfileBlocker(
                ProfileBlockerCode.MissingDependency,
                missing.DependsOn,
                $"Package '{missing.Package}' needs '{missing.DependsOn}', which is not available")),
            .. selection.VersionConflicts.Select(conflict => new ProfileBlocker(
                ProfileBlockerCode.VersionConflict,
                conflict.DependsOn,
                $"Package '{conflict.Package}' needs '{conflict.DependsOn}' {conflict.RequiredRange}, but version {conflict.ActualVersion} is what is available")),
            .. selection.Cycles.Select(cycle => new ProfileBlocker(
                ProfileBlockerCode.DependencyCycle,
                string.Join(" → ", cycle),
                $"Packages depend on each other in a circle: {string.Join(" → ", cycle)}"))
        ];
    }

    static IEnumerable<ProfileBlocker> ShellBlockers(ProfileBlockerContext context) =>
        (context.Shell?.Diagnostics ?? [])
            .Where(diagnostic => _unusableShell.Contains(diagnostic.Code))
            .Select(diagnostic => new ProfileBlocker(ProfileBlockerCode.ShellUnusable, diagnostic.Subject ?? context.Shell!.Name, diagnostic.Message, diagnostic.Code));

    static IEnumerable<ProfileBlocker> ThemeBlockers(UiProfile profile, ProfileBlockerContext context)
    {
        if (context.Theme is null)
        {
            return [];
        }

        var missing = ThemeCompatibility.IncompatiblePackages(context.Theme, profile);
        return missing.Count == 0
            ? []
            :
            [
                new ProfileBlocker(
                    ProfileBlockerCode.ThemeIncompatible,
                    context.Theme.Name,
                    $"Theme '{context.Theme.Name}' is not marked compatible with {string.Join(", ", missing.Select(item => $"'{item}'"))}, which profile '{profile.Name}' uses")
            ];
    }

    static IEnumerable<ProfileBlocker> DefaultTemplateBlockers(UiProfile profile, Vocabulary vocabulary)
    {
        var defaultTemplate = profile.Defaults?.NewScreenTemplate;
        return defaultTemplate is not null && !vocabulary.ScreenTemplates.ContainsKey(defaultTemplate.Id)
            ?
            [
                new ProfileBlocker(
                    ProfileBlockerCode.DefaultScreenTemplateUnavailable,
                    defaultTemplate.Id,
                    $"Screen template '{defaultTemplate.Id}', the default for new screens of profile '{profile.Name}', is not provided by the application or its packages")
            ]
            : [];
    }

    static IEnumerable<ProfileBlocker> UsageBlockers(string profileName, ProfileUsage usage, Vocabulary vocabulary) =>
    [
        .. Unavailable(usage.Layouts, vocabulary.Layouts, ProfileBlockerCode.UsedLayoutUnavailable, item => $"Screen '{usage.Screen}' uses layout '{item}', which the packages of profile '{profileName}' do not provide"),
        .. Unavailable(usage.ScreenTemplates, vocabulary.ScreenTemplates, ProfileBlockerCode.UsedScreenTemplateUnavailable, item => $"Screen '{usage.Screen}' uses screen template '{item}', which the packages of profile '{profileName}' do not provide"),
        .. Unavailable(usage.DialogTemplates, vocabulary.DialogTemplates, ProfileBlockerCode.UsedDialogTemplateUnavailable, item => $"Screen '{usage.Screen}' uses dialog template '{item}', which the packages of profile '{profileName}' do not provide"),
        .. usage.Slots
            .Where(slotUsage => vocabulary.SlotsOf(slotUsage.Owner)?.Contains(slotUsage.Slot) == false)
            .Select(slotUsage => new ProfileBlocker(
                ProfileBlockerCode.UsedSlotUnavailable,
                $"{slotUsage.Owner}.{slotUsage.Slot}",
                $"Screen '{usage.Screen}' places content in slot '{slotUsage.Slot}' of '{slotUsage.Owner}', which no longer has it"))
    ];

    static IEnumerable<ProfileBlocker> Unavailable(IEnumerable<string> used, Dictionary<string, List<string>> provided, ProfileBlockerCode code, Func<string, string> message) =>
        used.Where(item => !provided.ContainsKey(item)).Select(item => new ProfileBlocker(code, item, message(item)));

    static ProfileBlocker? ThemeNeedsPackage(UiProfile profile, ProfileBlockerContext context)
    {
        var theme = profile.Theme ?? context.Theme?.Name;
        if (theme is null)
        {
            return null;
        }

        var suppliers = context.Packages.Where(candidate => candidate.Themes.Contains(theme)).ToList();
        return suppliers.Count > 0 && !suppliers.Exists(supplier => profile.Packages.Contains(supplier.Name))
            ? Warning(
                ProfileBlockerCode.ThemeNeedsPackage,
                theme,
                $"Theme '{theme}' comes from '{suppliers[0].Name}', which is not in the package list",
                new ProfileFix(ProfileFixKind.AddPackage, "Add package", suppliers[0].Name))
            : null;
    }

    static ProfileBlocker? AccentTooLight(UiProfile profile)
    {
        var accent = profile.Appearance?.Accent;
        if (string.IsNullOrEmpty(accent))
        {
            return null;
        }

        var contrast = Contrast.AgainstWhite(accent);
        return contrast.Valid && contrast.Ratio < Contrast.MinimumAccent
            ? Warning(
                ProfileBlockerCode.AccentTooLight,
                accent,
                $"Accent {accent} is too light for white button text ({contrast.Ratio.Value.ToString("0.00", CultureInfo.InvariantCulture)}:1; it needs at least {Contrast.MinimumAccent.ToString(CultureInfo.InvariantCulture)}:1)",
                new ProfileFix(ProfileFixKind.UseThemeAccent, "Use theme accent"))
            : null;
    }

    static ProfileBlocker? OwnShellHasNoValue(UiProfile profile) =>
        profile.Root?.Template is { Source: TemplateReferenceSource.Own } template && string.IsNullOrWhiteSpace(template.Id)
            ? Warning(
                ProfileBlockerCode.OwnShellHasNoValue,
                "root",
                "My own shell is chosen but names nothing; enter a package name or a path",
                new ProfileFix(ProfileFixKind.UseDefaultBlueprint, "Use default blueprint"))
            : null;

    static ProfileBlocker? LogoImageMissing(UiProfile profile) =>
        profile.Identity?.Logo is { Kind: LogoKind.Image } logo && string.IsNullOrEmpty(logo.Image)
            ? Warning(
                ProfileBlockerCode.LogoImageMissing,
                "logo",
                "The logo is an image, but no image is chosen",
                new ProfileFix(ProfileFixKind.UseInitials, "Use initials"))
            : null;

    static ProfileBlocker? RevealNeedsHover(UiProfile profile) =>
        profile.DefaultSizeClass == TargetSizeClass.Compact && ShellOptions.Normalize(ModeOf(profile)) == NavigationMode.Reveal
            ? Info(
                ProfileBlockerCode.RevealNeedsHover,
                "navigationMode",
                "Reveal needs a pointer that can hover, so a touch screen shows a drawer instead",
                new ProfileFix(ProfileFixKind.SwitchToDrawer, "Switch to Drawer"))
            : null;

    static UiProfile UseInitials(UiProfile profile) =>
        profile with { Identity = (profile.Identity ?? new ProfileIdentity()) with { Logo = (profile.Identity?.Logo ?? new ProfileLogo()) with { Kind = LogoKind.Initials } } };

    static UiProfile SwitchToDrawer(UiProfile profile) =>
        profile.Root is null
            ? profile
            : profile with
            {
                Root = profile.Root with
                {
                    Options = new Dictionary<string, JsonNode?>(profile.Root.Options ?? new Dictionary<string, JsonNode?>()) { ["navigationMode"] = JsonValue.Create("drawer") }
                }
            };

    static string? ModeOf(UiProfile profile) =>
        profile.Root?.Options is not null && profile.Root.Options.TryGetValue("navigationMode", out var mode) && mode is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    static ProfileBlocker Warning(ProfileBlockerCode code, string subject, string message, ProfileFix fix) =>
        new(code, subject, message, null, ProblemSeverity.Warning, SectionOf(code), fix);

    static ProfileBlocker Info(ProfileBlockerCode code, string subject, string message, ProfileFix fix) =>
        new(code, subject, message, null, ProblemSeverity.Info, SectionOf(code), fix);

    static ProfileSection SectionOf(ProfileBlockerCode code) => code switch
    {
        ProfileBlockerCode.ThemeIncompatible or ProfileBlockerCode.ThemeNeedsPackage or ProfileBlockerCode.AccentTooLight => ProfileSection.Look,
        ProfileBlockerCode.DefaultScreenTemplateUnavailable or ProfileBlockerCode.ShellUnusable or ProfileBlockerCode.OwnShellHasNoValue => ProfileSection.Shell,
        ProfileBlockerCode.LogoImageMissing => ProfileSection.App,
        ProfileBlockerCode.RevealNeedsHover => ProfileSection.Menu,
        _ => ProfileSection.Packages
    };

    sealed class Vocabulary
    {
        public Dictionary<string, List<string>> Layouts { get; } = new(StringComparer.Ordinal);

        public Dictionary<string, List<string>> ScreenTemplates { get; } = new(StringComparer.Ordinal);

        public Dictionary<string, List<string>> DialogTemplates { get; } = new(StringComparer.Ordinal);

        public static Vocabulary Of(UiProfile profile, TemplateLibrary library)
        {
            var vocabulary = new Vocabulary();
            var installed = library.Blueprints.Where(candidate => profile.Packages.Contains(candidate.Manifest.Name));
            foreach (var source in new[] { library.Own }.Concat(installed).OfType<TemplateSource>())
            {
                vocabulary.Add(source);
            }

            return vocabulary;
        }

        public List<string>? SlotsOf(string owner) =>
            Layouts.TryGetValue(owner, out var layout) ? layout
            : ScreenTemplates.TryGetValue(owner, out var screenTemplate) ? screenTemplate
            : DialogTemplates.TryGetValue(owner, out var dialogTemplate) ? dialogTemplate
            : null;

        static void AddAll<T>(Dictionary<string, List<string>> target, IEnumerable<T>? items, Func<T, string> nameOf, Func<T, IEnumerable<string>> slotNamesOf)
        {
            foreach (var item in items ?? [])
            {
                target.TryAdd(nameOf(item), [.. slotNamesOf(item)]);
            }
        }

        void Add(TemplateSource source)
        {
            AddAll(Layouts, source.Layouts, layout => layout.Name, layout => layout.Slots.Select(slot => slot.Name));
            AddAll(ScreenTemplates, source.ScreenTemplates, template => template.Name, template => template.Slots.Select(slot => slot.Name));
            AddAll(DialogTemplates, source.DialogTemplates, template => template.Name, template => template.Slots.Select(slot => slot.Name));
        }
    }
}
