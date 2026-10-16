// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Resolves template references against the templates that exist, including the blueprint version pin.
/// The TypeScript engine (<c language="csharp">resolveTemplateReference</c>) reports the same outcomes and messages;
/// both are asserted against <c language="csharp">template-applicability-fixtures.json</c>.
/// </summary>
public static class TemplateReferenceResolver
{
    /// <summary>
    /// Resolves one reference.
    /// </summary>
    /// <param name="reference">The reference to resolve.</param>
    /// <param name="library">The templates that exist.</param>
    /// <returns>Whether the reference resolved and, when it did not, why.</returns>
    public static TemplateReferenceResolution Resolve(TemplateReference reference, TemplateLibrary library)
    {
        if (string.IsNullOrWhiteSpace(reference.Id))
        {
            return new(TemplateReferenceStatus.Malformed, Message: "A template reference must name a template");
        }

        if (reference.Source == TemplateReferenceSource.Own)
        {
            if (reference.Blueprint is not null || reference.Version is not null)
            {
                return new(TemplateReferenceStatus.Malformed, Message: $"Own template reference '{reference.Id}' must not name a blueprint or a version");
            }

            return library.Own is null
                ? Unknown(reference, null)
                : Find(reference.Id, library.Own, reference);
        }

        if (string.IsNullOrWhiteSpace(reference.Blueprint))
        {
            return new(TemplateReferenceStatus.Malformed, Message: $"Blueprint template reference '{reference.Id}' must name its blueprint");
        }

        var blueprint = library.Blueprints.FirstOrDefault(source => source.Manifest.Name == reference.Blueprint);
        if (blueprint is null)
        {
            return new(TemplateReferenceStatus.UnknownBlueprint, Message: $"Blueprint '{reference.Blueprint}' referenced by template '{reference.Id}' is not available");
        }

        var installed = blueprint.Manifest.Version;
        if (reference.Version is not null)
        {
            if (!PackageVersionRange.IsValidRange(reference.Version))
            {
                return new(TemplateReferenceStatus.Malformed, blueprint.Manifest.Name, installed, Message: $"Template reference '{reference.Id}' declares an invalid version range '{reference.Version}'");
            }

            if (!PackageVersionRange.IsSatisfiedBy(installed, reference.Version))
            {
                return new(TemplateReferenceStatus.VersionNotSatisfied, blueprint.Manifest.Name, installed, Message: $"Template '{reference.Id}' was chosen from blueprint '{blueprint.Manifest.Name}' {reference.Version} but version {installed} is installed");
            }
        }

        return Find(reference.Id, blueprint, reference);
    }

    static TemplateReferenceResolution Find(string name, TemplateSource source, TemplateReference reference)
    {
        var kind = TemplateKindOf(name, source);
        return kind is null
            ? Unknown(reference, source)
            : new(TemplateReferenceStatus.Resolved, source.Manifest.Name, source.Manifest.Version, kind);
    }

    static TemplateReferenceResolution Unknown(TemplateReference reference, TemplateSource? source) =>
        new(TemplateReferenceStatus.UnknownTemplate, source?.Manifest.Name, source?.Manifest.Version, Message: UnknownMessage(reference));

    static string UnknownMessage(TemplateReference reference) =>
        reference.Source == TemplateReferenceSource.Own
            ? $"Own template '{reference.Id}' does not exist"
            : $"Blueprint '{reference.Blueprint}' has no template '{reference.Id}'";

    /// <summary>
    /// Which kind of template <paramref name="name"/> is in a source. A source that carries the templates themselves answers from them; one known only
    /// by its manifest - a package approved for a render, whose bundle is not loaded here - answers from the names the manifest lists, so a reference
    /// to a template the package does not ship is still diagnosed instead of being left to resolve to nothing.
    /// </summary>
    /// <param name="name">The template name.</param>
    /// <param name="source">The source to look in.</param>
    /// <returns>The kind, or null when the source has no such template.</returns>
    static TemplateCatalogKind? TemplateKindOf(string name, TemplateSource source)
    {
        var screenTemplates = source.ScreenTemplates?.Select(template => template.Name) ?? source.Manifest.ScreenTemplates;
        var dialogTemplates = source.DialogTemplates?.Select(template => template.Name) ?? source.Manifest.DialogTemplates;
        var layouts = source.Layouts?.Select(layout => layout.Name) ?? source.Manifest.Layouts;

        if (screenTemplates.Contains(name))
        {
            return TemplateCatalogKind.ScreenTemplate;
        }

        if (dialogTemplates.Contains(name))
        {
            return TemplateCatalogKind.DialogTemplate;
        }

        return layouts.Contains(name) ? TemplateCatalogKind.Layout : null;
    }
}
