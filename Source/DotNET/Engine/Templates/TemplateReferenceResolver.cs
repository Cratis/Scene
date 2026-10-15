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

    static TemplateCatalogKind? TemplateKindOf(string name, TemplateSource source)
    {
        if ((source.ScreenTemplates ?? []).Any(template => template.Name == name))
        {
            return TemplateCatalogKind.ScreenTemplate;
        }

        if ((source.DialogTemplates ?? []).Any(template => template.Name == name))
        {
            return TemplateCatalogKind.DialogTemplate;
        }

        return (source.Layouts ?? []).Any(layout => layout.Name == name) ? TemplateCatalogKind.Layout : null;
    }
}
