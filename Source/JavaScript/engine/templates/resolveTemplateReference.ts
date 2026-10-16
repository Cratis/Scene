// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReference, TemplateReferenceSource } from '@cratis/scene.model';
import { isValidVersionRange, isVersionSatisfiedBy } from '../packageVersionRange';
import { TemplateCatalogKind } from './TemplateCatalogKind';
import { TemplateLibrary } from './TemplateLibrary';
import { TemplateReferenceResolution, TemplateReferenceStatus } from './TemplateReferenceResolution';
import { TemplateSource } from './TemplateSource';

/**
 * Resolves a template reference against the templates that exist, including the blueprint version pin. The C#
 * engine (`TemplateReferenceResolver.Resolve`) reports the same outcomes and messages; both are asserted against
 * `template-applicability-fixtures.json`.
 */
export function resolveTemplateReference(reference: TemplateReference, library: TemplateLibrary): TemplateReferenceResolution {
    if (!reference.id?.trim()) {
        return { status: TemplateReferenceStatus.Malformed, message: 'A template reference must name a template' };
    }

    if (reference.source === TemplateReferenceSource.Own) {
        if (reference.blueprint !== undefined || reference.version !== undefined) {
            return { status: TemplateReferenceStatus.Malformed, message: `Own template reference '${reference.id}' must not name a blueprint or a version` };
        }
        return library.own ? find(reference.id, library.own, reference) : unknown(reference, undefined);
    }

    if (!reference.blueprint?.trim()) {
        return { status: TemplateReferenceStatus.Malformed, message: `Blueprint template reference '${reference.id}' must name its blueprint` };
    }

    const blueprint = library.blueprints.find(source => source.manifest.name === reference.blueprint);
    if (!blueprint) {
        return { status: TemplateReferenceStatus.UnknownBlueprint, message: `Blueprint '${reference.blueprint}' referenced by template '${reference.id}' is not available` };
    }

    const installed = blueprint.manifest.version;
    if (reference.version !== undefined) {
        if (!isValidVersionRange(reference.version)) {
            return {
                status: TemplateReferenceStatus.Malformed, package: blueprint.manifest.name, packageVersion: installed,
                message: `Template reference '${reference.id}' declares an invalid version range '${reference.version}'`,
            };
        }
        if (!isVersionSatisfiedBy(installed, reference.version)) {
            return {
                status: TemplateReferenceStatus.VersionNotSatisfied, package: blueprint.manifest.name, packageVersion: installed,
                message: `Template '${reference.id}' was chosen from blueprint '${blueprint.manifest.name}' ${reference.version} but version ${installed} is installed`,
            };
        }
    }

    return find(reference.id, blueprint, reference);
}

function find(name: string, source: TemplateSource, reference: TemplateReference): TemplateReferenceResolution {
    const kind = kindOf(name, source);
    return kind === undefined
        ? unknown(reference, source)
        : { status: TemplateReferenceStatus.Resolved, package: source.manifest.name, packageVersion: source.manifest.version, kind };
}

function unknown(reference: TemplateReference, source: TemplateSource | undefined): TemplateReferenceResolution {
    return {
        status: TemplateReferenceStatus.UnknownTemplate,
        package: source?.manifest.name,
        packageVersion: source?.manifest.version,
        message: reference.source === TemplateReferenceSource.Own
            ? `Own template '${reference.id}' does not exist`
            : `Blueprint '${reference.blueprint}' has no template '${reference.id}'`,
    };
}

/**
 * Which kind of template `name` is in a source. A source that carries the templates themselves answers from them; one known only by its manifest -
 * a package approved for a render, whose bundle is not loaded here - answers from the names the manifest lists, so a reference to a template the
 * package does not ship is still diagnosed instead of being left to resolve to nothing.
 */
function kindOf(name: string, source: TemplateSource): TemplateCatalogKind | undefined {
    const screenTemplates = source.screenTemplates?.map(template => template.name) ?? source.manifest.screenTemplates;
    const dialogTemplates = source.dialogTemplates?.map(template => template.name) ?? source.manifest.dialogTemplates;
    const layouts = source.layouts?.map(layout => layout.name) ?? source.manifest.layouts;
    if (screenTemplates.includes(name)) return TemplateCatalogKind.ScreenTemplate;
    if (dialogTemplates.includes(name)) return TemplateCatalogKind.DialogTemplate;
    if (layouts.includes(name)) return TemplateCatalogKind.Layout;
    return undefined;
}
