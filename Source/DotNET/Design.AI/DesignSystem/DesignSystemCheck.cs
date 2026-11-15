// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;
using Cratis.Scene.Screenplay;
using Cratis.Scene.Screenplay.DesignSystems;
using Cratis.Screenplay;
using DiagnosticSeverity = Cratis.Screenplay.Diagnostics.DiagnosticSeverity;

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// Checks the Screenplay of a design system draft: the compiler's own diagnostics, and what Scene finds when it resolves the draft - a token a theme gives
/// no value in a mode, a part that uses a token that is not there, a contrast rule that is not met.
/// </summary>
internal static class DesignSystemCheck
{
    static readonly ScreenplayCompiler _compiler = new();

    /// <summary>
    /// Checks a draft.
    /// </summary>
    /// <param name="text">The Screenplay of the draft.</param>
    /// <returns>What is wrong with it, and what is worth knowing; the draft is clean when none of it is an error.</returns>
    public static IReadOnlyList<DesignDiagnostic> Check(string text)
    {
        var compilation = _compiler.Compile(text);
        List<DesignDiagnostic> diagnostics = [.. compilation.Diagnostics.Select(diagnostic => new DesignDiagnostic(
            $"screenplay:{diagnostic.Code}",
            diagnostic.Severity == DiagnosticSeverity.Error ? "error" : "warning",
            $"{diagnostic.Message} (line {diagnostic.Location.Line})"))];
        if (compilation.Value is not { } application)
        {
            return diagnostics;
        }

        if (!application.DesignSystems.Any())
        {
            diagnostics.Add(new DesignDiagnostic("noDesignSystem", "error", "The text declares no `design system`."));
            return diagnostics;
        }

        if (application.DesignSystems.Count() > 1)
        {
            diagnostics.Add(new DesignDiagnostic("oneDesignSystem", "error", "The text declares more than one `design system`; a product has one."));
        }

        var conversion = new ConversionDiagnostics();
        var designSystem = DesignSystemConverter.Convert(application, null, conversion);
        diagnostics.AddRange(conversion.All.Select(item => new DesignDiagnostic($"screenplay:{item.Code}", item.Severity == DiagnosticSeverity.Error ? "error" : "warning", item.Message)));
        if (designSystem is null)
        {
            return diagnostics;
        }

        if (designSystem.Themes.Count == 0)
        {
            diagnostics.Add(new DesignDiagnostic("noTheme", "error", $"No `theme` implements '{designSystem.Name}': a design system without a theme has no values."));
        }

        foreach (var theme in designSystem.Themes)
        {
            foreach (var mode in theme.Modes)
            {
                diagnostics.AddRange((mode.Problems ?? []).Select(problem => new DesignDiagnostic("themeIncomplete", "error", $"Theme '{theme.Name}', mode '{mode.Mode}': {problem}")));
            }
        }

        diagnostics.AddRange((designSystem.ContrastFindings ?? []).Select(finding => new DesignDiagnostic(
            "contrastBelowRule",
            "warning",
            $"{finding.Component} {finding.Variant}{(finding.State is null ? string.Empty : $" ({finding.State})")}: {finding.Foreground} on {finding.Background} is {finding.Ratio:0.0}:1 in {finding.Theme} {finding.Mode}, the rule asks for {finding.Required:0.0}:1.")));
        return diagnostics;
    }
}
