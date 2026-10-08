// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Screens;

/// <summary>
/// Shared applicability rules for template selection and validation at any application depth.
/// Invalid input is diagnosed rather than rewritten; absent templates allow outlet-only composition.
/// </summary>
public static class TemplateApplicability
{
    static readonly string[] _contentTypes = ["Workspace", "List", "Detail", "Form"];

    /// <summary>
    /// Validates application-shell selection without introducing a competing shell model.
    /// </summary>
    /// <param name="layout">The selected layout, or no selection.</param>
    /// <param name="scope">The target hierarchy scope.</param>
    /// <returns>Actionable incompatibility diagnostics.</returns>
    public static IReadOnlyList<string> ValidateLayout(Layout? layout, TemplateScope scope) =>
        layout is null ? [] : ValidateRole(layout.Name, nameof(Layout), layout.Metadata, scope);

    /// <summary>
    /// Validates a screen template including qualified fitsSlot names against its immediate container.
    /// </summary>
    /// <param name="template">The selected template, or no selection.</param>
    /// <param name="scope">The target hierarchy scope.</param>
    /// <param name="container">The containing layout or template, if known.</param>
    /// <returns>Actionable incompatibility diagnostics.</returns>
    public static IReadOnlyList<string> ValidateScreenTemplate(ScreenTemplate? template, TemplateScope scope, TemplateContainer? container = null)
    {
        if (template is null)
        {
            return [];
        }

        var problems = ValidateRole(template.Name, nameof(ScreenTemplate), template.Metadata, scope).ToList();
        if (template.FitsSlot is not null)
        {
            var separator = template.FitsSlot.LastIndexOf('.');
            var qualifier = separator < 0 ? null : template.FitsSlot[..separator];
            var slot = separator < 0 ? template.FitsSlot : template.FitsSlot[(separator + 1)..];
            if (container is null || (qualifier is not null && qualifier != container.Name) || !container.Slots.Any(candidate => candidate.Name == slot))
            {
                problems.Add($"Template '{template.Name}' does not fit slot '{template.FitsSlot}' on '{container?.Name ?? "(no container)"}'");
            }
        }

        return problems;
    }

    /// <summary>
    /// Validates an overlay template separately from slot-based screen composition.
    /// </summary>
    /// <param name="template">The selected overlay, or no selection.</param>
    /// <param name="scope">The target hierarchy scope.</param>
    /// <returns>Actionable incompatibility diagnostics.</returns>
    public static IReadOnlyList<string> ValidateDialogTemplate(DialogTemplate? template, TemplateScope scope) =>
        template is null ? [] : ValidateRole(template.Name, nameof(DialogTemplate), template.Metadata, scope);

    /// <summary>
    /// Filters a picker with exactly the rules applied when accepting a selection.
    /// </summary>
    /// <param name="templates">Available templates in browse order.</param>
    /// <param name="scope">The target hierarchy scope.</param>
    /// <param name="container">The containing layout or template, if known.</param>
    /// <returns>The applicable templates in their original order.</returns>
    public static IEnumerable<ScreenTemplate> FilterScreenTemplates(IEnumerable<ScreenTemplate> templates, TemplateScope scope, TemplateContainer? container = null) =>
        templates.Where(template => ValidateScreenTemplate(template, scope, container).Count == 0);

    static List<string> ValidateRole(string name, string kind, TemplateMetadata? metadata, TemplateScope scope)
    {
        var problems = new List<string>();
        if (!Enum.IsDefined(scope))
        {
            problems.Add($"Template '{name}' has unknown target scope '{scope}'");
        }
        else if (kind == nameof(Layout) != (scope == TemplateScope.Application))
        {
            problems.Add($"Template '{name}' of kind '{kind}' cannot be applied at scope '{scope}'");
        }

        if (metadata?.Type == "ApplicationShell" && kind != nameof(Layout))
        {
            problems.Add($"Template '{name}' of type 'ApplicationShell' must be a Layout");
        }

        if (metadata?.Type == "Dialog" && kind != nameof(DialogTemplate))
        {
            problems.Add($"Template '{name}' of type 'Dialog' must be a DialogTemplate");
        }

        if (kind == nameof(Layout) && _contentTypes.Contains(metadata?.Type, StringComparer.Ordinal))
        {
            problems.Add($"Template '{name}' of type '{metadata?.Type}' must not be a Layout");
        }

        foreach (var declaredScope in (metadata?.Scopes ?? []).Where(declaredScope => !Enum.IsDefined(declaredScope)))
        {
            problems.Add($"Template '{name}' declares unknown scope '{declaredScope}'");
        }

        if (metadata?.Scopes is not null && !metadata.Scopes.Contains(scope))
        {
            problems.Add($"Template '{name}' does not declare scope '{scope}'");
        }

        return problems;
    }
}
