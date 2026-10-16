// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Engine.Shell;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Profiles;

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
        var blockers = new List<ProfileBlocker>();
        var name = profile.Name;

        var selection = PackageDependencyResolver.Resolve(profile.Packages, context.Packages);
        blockers.AddRange(selection.Missing.Select(missing => new ProfileBlocker(
            ProfileBlockerCode.MissingDependency,
            missing.DependsOn,
            $"Package '{missing.Package}' needs '{missing.DependsOn}', which is not available")));
        blockers.AddRange(selection.VersionConflicts.Select(conflict => new ProfileBlocker(
            ProfileBlockerCode.VersionConflict,
            conflict.DependsOn,
            $"Package '{conflict.Package}' needs '{conflict.DependsOn}' {conflict.RequiredRange}, but version {conflict.ActualVersion} is what is available")));
        blockers.AddRange(selection.Cycles.Select(cycle => new ProfileBlocker(
            ProfileBlockerCode.DependencyCycle,
            string.Join(" → ", cycle),
            $"Packages depend on each other in a circle: {string.Join(" → ", cycle)}")));

        foreach (var diagnostic in context.Shell?.Diagnostics ?? [])
        {
            if (_unusableShell.Contains(diagnostic.Code))
            {
                blockers.Add(new ProfileBlocker(ProfileBlockerCode.ShellUnusable, diagnostic.Subject ?? context.Shell!.Name, diagnostic.Message, diagnostic.Code));
            }
        }

        if (context.Theme is not null)
        {
            var missing = ThemeCompatibility.IncompatiblePackages(context.Theme, profile);
            if (missing.Count > 0)
            {
                blockers.Add(new ProfileBlocker(
                    ProfileBlockerCode.ThemeIncompatible,
                    context.Theme.Name,
                    $"Theme '{context.Theme.Name}' is not marked compatible with {string.Join(", ", missing.Select(item => $"'{item}'"))}, which profile '{name}' uses"));
            }
        }

        var vocabulary = Vocabulary.Of(profile, context.Library);
        var defaultTemplate = profile.Defaults?.NewScreenTemplate;
        if (defaultTemplate is not null && !vocabulary.ScreenTemplates.ContainsKey(defaultTemplate.Id))
        {
            blockers.Add(new ProfileBlocker(
                ProfileBlockerCode.DefaultScreenTemplateUnavailable,
                defaultTemplate.Id,
                $"Screen template '{defaultTemplate.Id}', the default for new screens of profile '{name}', is not provided by the application or its packages"));
        }

        foreach (var usage in context.Usages ?? [])
        {
            blockers.AddRange(usage.Layouts.Where(item => !vocabulary.Layouts.ContainsKey(item)).Select(item => new ProfileBlocker(
                ProfileBlockerCode.UsedLayoutUnavailable, item, $"Screen '{usage.Screen}' uses layout '{item}', which the packages of profile '{name}' do not provide")));
            blockers.AddRange(usage.ScreenTemplates.Where(item => !vocabulary.ScreenTemplates.ContainsKey(item)).Select(item => new ProfileBlocker(
                ProfileBlockerCode.UsedScreenTemplateUnavailable, item, $"Screen '{usage.Screen}' uses screen template '{item}', which the packages of profile '{name}' do not provide")));
            blockers.AddRange(usage.DialogTemplates.Where(item => !vocabulary.DialogTemplates.ContainsKey(item)).Select(item => new ProfileBlocker(
                ProfileBlockerCode.UsedDialogTemplateUnavailable, item, $"Screen '{usage.Screen}' uses dialog template '{item}', which the packages of profile '{name}' do not provide")));

            foreach (var (owner, slot) in usage.Slots)
            {
                var slots = vocabulary.SlotsOf(owner);
                if (slots?.Contains(slot) == false)
                {
                    blockers.Add(new ProfileBlocker(
                        ProfileBlockerCode.UsedSlotUnavailable,
                        $"{owner}.{slot}",
                        $"Screen '{usage.Screen}' places content in slot '{slot}' of '{owner}', which no longer has it"));
                }
            }
        }

        return blockers;
    }

    sealed class Vocabulary
    {
        public Dictionary<string, List<string>> Layouts { get; } = new(StringComparer.Ordinal);

        public Dictionary<string, List<string>> ScreenTemplates { get; } = new(StringComparer.Ordinal);

        public Dictionary<string, List<string>> DialogTemplates { get; } = new(StringComparer.Ordinal);

        public static Vocabulary Of(UiProfile profile, TemplateLibrary library)
        {
            var vocabulary = new Vocabulary();
            var installed = library.Blueprints.Where(candidate => profile.Packages.Contains(candidate.Manifest.Name));
            foreach (var source in new[] { library.Own }.Concat(installed))
            {
                if (source is null)
                {
                    continue;
                }

                foreach (var layout in source.Layouts ?? [])
                {
                    vocabulary.Layouts.TryAdd(layout.Name, [.. layout.Slots.Select(slot => slot.Name)]);
                }

                foreach (var template in source.ScreenTemplates ?? [])
                {
                    vocabulary.ScreenTemplates.TryAdd(template.Name, [.. template.Slots.Select(slot => slot.Name)]);
                }

                foreach (var template in source.DialogTemplates ?? [])
                {
                    vocabulary.DialogTemplates.TryAdd(template.Name, [.. template.Slots.Select(slot => slot.Name)]);
                }
            }

            return vocabulary;
        }

        public List<string>? SlotsOf(string owner) =>
            Layouts.TryGetValue(owner, out var layout) ? layout
            : ScreenTemplates.TryGetValue(owner, out var screenTemplate) ? screenTemplate
            : DialogTemplates.TryGetValue(owner, out var dialogTemplate) ? dialogTemplate
            : null;
    }
}
