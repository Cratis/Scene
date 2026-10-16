// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Decides which templates a picker offers at a target, so no host re-implements the rules.
/// </summary>
/// <remarks>
/// <para>
/// It composes <see cref="TemplateApplicability"/> (kind and scope, explicit scopes override, category never implies a scope,
/// slot fit against the container) and <see cref="ScreenTemplateResolver"/> (a template must find exactly one home and nothing may nest inside itself)
/// with the defaults of each hierarchy level, used when a template declares no scopes:
/// </para>
/// <list type="bullet">
/// <item><description>Application - layouts.</description></item>
/// <item><description>Module, Feature, Subfeature - screen templates, fitting a slot of the container.</description></item>
/// <item><description>Slice, state change - dialog templates.</description></item>
/// <item><description>Slice, state view - screen templates that declare the Slice scope or state view slice kinds.</description></item>
/// </list>
/// <para>
/// Declared <see cref="TemplateMetadata.Scopes"/> and <see cref="TemplateMetadata.SliceKinds"/> always override the defaults.
/// The TypeScript engine (<c language="csharp">applicableTemplates</c>) returns identical results; both are asserted against
/// <c language="csharp">template-applicability-fixtures.json</c>.
/// </para>
/// </remarks>
public static class ApplicableTemplates
{
    static readonly TemplateScope[] _screenScopes = [TemplateScope.Module, TemplateScope.Feature, TemplateScope.Subfeature];
    static readonly SliceKind[] _dialogSliceKinds = [SliceKind.StateChange];
    static readonly SliceKind[] _screenSliceKinds = [SliceKind.StateChange, SliceKind.StateView];

    /// <summary>
    /// Computes what a picker offers at a target: own templates by category, then each blueprint that has at least one applicable template.
    /// </summary>
    /// <param name="library">The templates that exist.</param>
    /// <param name="target">Where the template is going to be applied.</param>
    /// <returns>The applicable templates. Blueprints without any applicable template are omitted.</returns>
    public static ApplicableTemplateSet Compute(TemplateLibrary library, TemplateTarget target)
    {
        var own = library.Own is null ? [] : Group(Applicable(library.Own, target, isBlueprint: false));
        var blueprints = new List<ApplicableBlueprint>();
        foreach (var source in library.Blueprints)
        {
            var groups = Group(Applicable(source, target, isBlueprint: true));
            if (groups.Count > 0)
            {
                blueprints.Add(new(source.Manifest.Name, source.Manifest.Version, source.Manifest.DisplayName, groups));
            }
        }

        return new(own, blueprints);
    }

    /// <summary>
    /// Validates a layout against a target.
    /// </summary>
    /// <param name="layout">The layout.</param>
    /// <param name="target">Where it is going to be applied.</param>
    /// <returns>Why it does not apply; empty when it does.</returns>
    public static IReadOnlyList<string> Validate(Layout layout, TemplateTarget target) =>
        WithDefaults(TemplateApplicability.ValidateLayout(layout, target.Scope), layout.Name, TemplateCatalogKind.Layout, layout.Metadata, target);

    /// <summary>
    /// Validates a screen template against a target, including whether its slot nesting resolves.
    /// </summary>
    /// <param name="template">The screen template.</param>
    /// <param name="target">Where it is going to be applied.</param>
    /// <returns>Why it does not apply; empty when it does.</returns>
    public static IReadOnlyList<string> Validate(ScreenTemplate template, TemplateTarget target)
    {
        var problems = WithDefaults(TemplateApplicability.ValidateScreenTemplate(template, target.Scope, target.Container), template.Name, TemplateCatalogKind.ScreenTemplate, template.Metadata, target);
        if (problems.Count > 0)
        {
            return problems;
        }

        if (target.Chain?.Contains(template.Name, StringComparer.Ordinal) == true)
        {
            return [$"Template '{template.Name}' is already chosen above this target; nesting it again would make the chain loop"];
        }

        if (template.FitsSlot is not null && target.Container is not null)
        {
            var resolution = ScreenTemplateResolver.Resolve(new Layout(target.Container.Name, target.Container.Slots), [template]);
            if (!resolution.IsValid || !resolution.Placements.Any(placement => placement.Template == template.Name && placement.Container == target.Container.Name))
            {
                return [$"Template '{template.Name}' cannot be placed in '{target.Container.Name}': its slot nesting does not resolve"];
            }
        }

        return [];
    }

    /// <summary>
    /// Validates a dialog template against a target.
    /// </summary>
    /// <param name="template">The dialog template.</param>
    /// <param name="target">Where it is going to be applied.</param>
    /// <returns>Why it does not apply; empty when it does.</returns>
    public static IReadOnlyList<string> Validate(DialogTemplate template, TemplateTarget target) =>
        WithDefaults(TemplateApplicability.ValidateDialogTemplate(template, target.Scope), template.Name, TemplateCatalogKind.DialogTemplate, template.Metadata, target);

    static List<ApplicableTemplate> Applicable(TemplateSource source, TemplateTarget target, bool isBlueprint)
    {
        var manifest = source.Manifest;
        TemplateReference ReferenceTo(string name) => isBlueprint
            ? new(TemplateReferenceSource.Blueprint, name, manifest.Name, $"^{manifest.Version}")
            : new(TemplateReferenceSource.Own, name);

        var applicable = new List<ApplicableTemplate>();
        foreach (var layout in (source.Layouts ?? []).Where(layout => Validate(layout, target).Count == 0))
        {
            applicable.Add(new(manifest.Name, manifest.Version, TemplateCatalogKind.Layout, layout.Name, null, null, layout.Metadata, ReferenceTo(layout.Name)));
        }

        foreach (var template in (source.ScreenTemplates ?? []).Where(template => Validate(template, target).Count == 0))
        {
            applicable.Add(new(manifest.Name, manifest.Version, TemplateCatalogKind.ScreenTemplate, template.Name, template.DisplayName, template.Description, template.Metadata, ReferenceTo(template.Name)));
        }

        foreach (var template in (source.DialogTemplates ?? []).Where(template => Validate(template, target).Count == 0))
        {
            applicable.Add(new(manifest.Name, manifest.Version, TemplateCatalogKind.DialogTemplate, template.Name, template.DisplayName, template.Description, template.Metadata, ReferenceTo(template.Name)));
        }

        return applicable;
    }

    static List<ApplicableTemplateGroup> Group(List<ApplicableTemplate> templates)
    {
        static string? CategoryOf(ApplicableTemplate template) => string.IsNullOrWhiteSpace(template.Metadata?.Category) ? null : template.Metadata.Category;

        var categories = templates.Select(CategoryOf).OfType<string>().Distinct(StringComparer.Ordinal).ToList();
        var groups = categories.ConvertAll(category => new ApplicableTemplateGroup(category, templates.FindAll(template => CategoryOf(template) == category)));
        var uncategorized = templates.FindAll(template => CategoryOf(template) is null);
        if (uncategorized.Count > 0)
        {
            groups.Add(new(null, uncategorized));
        }

        return groups;
    }

    static IReadOnlyList<string> WithDefaults(IReadOnlyList<string> problems, string name, TemplateCatalogKind kind, TemplateMetadata? metadata, TemplateTarget target)
    {
        if (problems.Count > 0 || !Enum.IsDefined(target.Scope))
        {
            return problems;
        }

        if (metadata?.Scopes is null && !DefaultScopes(kind, metadata).Contains(target.Scope))
        {
            return [$"Template '{name}' is not offered at scope '{target.Scope}' unless it declares that scope"];
        }

        if (target.Scope == TemplateScope.Slice && target.SliceKind is { } sliceKind)
        {
            if (!Enum.IsDefined(sliceKind))
            {
                return [$"Template '{name}' has unknown target slice kind '{sliceKind}'"];
            }

            if (sliceKind == SliceKind.Automation)
            {
                return [$"Template '{name}' cannot be applied to an Automation slice, which has no presentation"];
            }

            var kinds = metadata?.SliceKinds ?? DefaultSliceKinds(kind);
            if (!kinds.Contains(sliceKind))
            {
                return [$"Template '{name}' does not apply to slice kind '{sliceKind}'"];
            }
        }

        return [];
    }

    static TemplateScope[] DefaultScopes(TemplateCatalogKind kind, TemplateMetadata? metadata) => kind switch
    {
        TemplateCatalogKind.Layout => [TemplateScope.Application],
        TemplateCatalogKind.DialogTemplate => [TemplateScope.Slice],
        _ when metadata?.Role == TemplateRole.Root => [TemplateScope.Application],
        _ => metadata?.SliceKinds is null ? _screenScopes : [TemplateScope.Slice]
    };

    static SliceKind[] DefaultSliceKinds(TemplateCatalogKind kind) =>
        kind == TemplateCatalogKind.DialogTemplate ? _dialogSliceKinds : _screenSliceKinds;
}
