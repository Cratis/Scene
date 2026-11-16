// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using Cratis.Scene.Engine.Design;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Screenplay.Design;
using Cratis.Screenplay.Diagnostics;
using SceneProfiles = Cratis.Scene.Model.Profiles;
using ScreenplaySyntax = Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.DesignSystems;

/// <summary>
/// Converts the design system an application declares - and what Screenplay's <see cref="DesignSystemResolver"/> resolves it to - into
/// Scene's resolved design system model, and links its components to the Scene components that render them.
/// </summary>
/// <remarks>
/// <para>
/// The design system is the contract: its modes, its token roles, and each component's parts, variants and states in terms of token roles.
/// Each theme that implements it carries, per mode, the value of every token and the component parts resolved to values, with the problems
/// the resolver found - exactly what the resolver answers, so the Scene engines, Stage and generated React cannot disagree with Screenplay
/// about what a primary button looks like in dark mode.
/// </para>
/// <para>
/// A component finds its Scene component by name through the profile's packages. <see cref="Link"/> runs Scene's own linker over the converted
/// design system; a component whose name does not say which Scene component renders it, or which property carries its variant, is given a
/// <see cref="ComponentMapping"/> by the caller. Screenplay does not declare one yet, so a design system that is only read from Screenplay links by name.
/// </para>
/// </remarks>
public static class DesignSystemConverter
{
    /// <summary>
    /// Converts the application's design system.
    /// </summary>
    /// <param name="application">The compiled application.</param>
    /// <param name="mappings">How a design-system component links to a Scene component when its name is not enough, by the component's name; or null to link all by name.</param>
    /// <param name="diagnostics">The collector for what cannot be carried, or null to leave it out silently.</param>
    /// <returns>The resolved design system, or null when the application declares none.</returns>
    public static DesignSystem? Convert(
        ScreenplaySyntax.ApplicationSyntax application,
        IReadOnlyDictionary<string, ComponentMapping>? mappings = null,
        ConversionDiagnostics? diagnostics = null)
    {
        if (application.DesignSystems.FirstOrDefault() is not { } designSystem)
        {
            return null;
        }

        var modes = designSystem.Modes.ToArray();
        var rules = ContrastRules(designSystem, diagnostics);
        DesignComponent[] components = [.. designSystem.Components.Select(component => Component(component, mappings))];
        var converted = new DesignSystem(
            designSystem.Name,
            modes,
            [.. designSystem.Tokens.SelectMany(category => category.Tokens.Select(token => new TokenRole(category.Category, token.Name, token.Description)))],
            components,
            [.. (application.Themes ?? []).Where(theme => theme.Implements == designSystem.Name).Select(theme => Theme(application, designSystem, theme, modes, components))],
            Words(designSystem.Words),
            rules.Count > 0 ? rules : null);
        return converted with { ContrastFindings = rules.Count > 0 ? DesignContrast.Measure(converted) : null };
    }

    /// <summary>
    /// Links the design system's components to the Scene components of the profile's packages.
    /// </summary>
    /// <param name="designSystem">The converted design system.</param>
    /// <param name="profile">The profile whose packages the components are looked up in.</param>
    /// <param name="catalog">Every active package's declared component names, keyed by package name.</param>
    /// <param name="components">The active packages' components, with the properties and anatomy each supports.</param>
    /// <returns>The links, and a diagnostic for every part, variant or state a component does not support and every component nobody renders.</returns>
    public static DesignLinking Link(
        DesignSystem designSystem,
        SceneProfiles.UiProfile profile,
        IReadOnlyDictionary<string, IReadOnlyList<string>> catalog,
        IReadOnlyList<LinkableComponent> components) =>
        DesignLinker.Link(designSystem, profile, catalog, components);

    static DesignComponent Component(ScreenplaySyntax.DesignComponentSyntax component, IReadOnlyDictionary<string, ComponentMapping>? mappings) =>
        new(
            component.Name,
            [.. component.Parts],
            [.. component.Variants.Select(Variant)],
            mappings is not null && mappings.TryGetValue(component.Name, out var mapping) ? mapping : null);

    static DesignVariant Variant(ScreenplaySyntax.DesignVariantSyntax variant) =>
        new(
            variant.Name,
            Assignments(variant.Parts),
            variant.States.Any() ? variant.States.ToDictionary(state => state.Name, state => (IReadOnlyDictionary<string, string>)Assignments(state.Parts), StringComparer.Ordinal) : null);

    static Dictionary<string, string> Assignments(IEnumerable<ScreenplaySyntax.DesignAssignmentSyntax> assignments) =>
        assignments.GroupBy(assignment => assignment.Name, StringComparer.Ordinal).ToDictionary(group => group.Key, group => group.Last().Value, StringComparer.Ordinal);

    static DesignTheme Theme(ScreenplaySyntax.ApplicationSyntax application, ScreenplaySyntax.DesignSystemSyntax designSystem, ScreenplaySyntax.ThemeSyntax theme, IReadOnlyList<string> modes, IReadOnlyList<DesignComponent> components) =>
        new(
            theme.Name,
            [.. modes.Select(mode => Mode(application, theme, mode, components))],
            theme.Name == designSystem.DefaultTheme);

    /// <summary>
    /// Resolves a theme in a mode: what the resolver answers and - where a part refers to a token the theme gives no value in the mode - what
    /// Scene's own evaluation says of it, so a part nobody can draw is named wherever the design system is read.
    /// </summary>
    static DesignThemeMode Mode(ScreenplaySyntax.ApplicationSyntax application, ScreenplaySyntax.ThemeSyntax theme, string mode, IReadOnlyList<DesignComponent> components)
    {
        if (DesignSystemResolver.Resolve(application, theme, mode) is not { } resolved)
        {
            return new(mode, new Dictionary<string, string>(), null, [$"The theme '{theme.Name}' cannot be resolved in the mode '{mode}'."]);
        }

        List<string> problems = [.. resolved.Problems, .. DesignComponentEvaluator.Evaluate(components, resolved.Tokens).Problems.Except(resolved.Problems, StringComparer.Ordinal)];
        return new(
            mode,
            resolved.Tokens,
            [.. resolved.Components.Select(component => new Cratis.Scene.Model.DesignSystems.ResolvedDesignComponent(
                component.Name,
                [.. component.Variants.Select(variant => new Cratis.Scene.Model.DesignSystems.ResolvedDesignVariant(
                    variant.Name,
                    variant.Parts,
                    variant.States.Count > 0 ? variant.States : null))]))],
            problems.Count > 0 ? problems : null);
    }

    static DesignWords? Words(ScreenplaySyntax.DesignWordsSyntax? words) =>
        words is null
            ? null
            : new(
                words.Voice.Any() ? Assignments(words.Voice) : null,
                words.Naming.Any() ? Assignments(words.Naming) : null);

    static List<ContrastRule> ContrastRules(ScreenplaySyntax.DesignSystemSyntax designSystem, ConversionDiagnostics? diagnostics)
    {
        List<ContrastRule> rules = [];
        foreach (var rule in designSystem.Rules)
        {
            if (double.TryParse(rule.Minimum.Split(':')[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var ratio))
            {
                rules.Add(new(rule.Foreground, rule.Background, ratio));
            }
            else
            {
                diagnostics?.Report(new(
                    "SCENE-DESIGN-001",
                    DiagnosticSeverity.Warning,
                    "DesignContrastRuleSyntax",
                    designSystem.Name,
                    rule.Location,
                    $"The contrast rule '{rule.Foreground} on {rule.Background}' states the ratio '{rule.Minimum}', which is not a number, so it was left out."));
            }
        }

        return rules;
    }
}
