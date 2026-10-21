// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, TemplateMetadata } from '@cratis/scene.model';
import { isVersionSatisfiedBy } from '../packageVersionRange';
import { TemplateCatalogEntry } from './TemplateCatalogEntry';
import { TemplateCatalogKind } from './TemplateCatalogKind';
import { TemplateSource } from './TemplateSource';
import { validateTemplateCategory, validateTemplateMetadata } from './validateTemplateMetadata';

/**
 * Describes every template the given packages provide, in package then layout, screen template, dialog
 * template order, with its compatibility, attribution and license metadata and whether it can be used.
 *
 * A template is compatible when its metadata is complete and valid, the Scene version (when given) satisfies
 * its Scene range, and every package it requires is among the given packages at a satisfying version and is
 * either its own package or one that package depends on. A blueprint template without a category is a problem; an
 * own template without one is a warning. Nothing is filtered out: a browser shows incompatible
 * templates with their problems rather than hiding why they are unavailable.
 */
export function describeTemplateCatalog(sources: TemplateSource[], sceneVersion?: string): TemplateCatalogEntry[] {
    const versions = new Map(sources.map(source => [source.manifest.name, source.manifest.version]));
    const entries: TemplateCatalogEntry[] = [];

    for (const source of sources) {
        const templates = [
            ...(source.layouts ?? []).map(template => ({ kind: TemplateCatalogKind.Layout, template })),
            ...(source.screenTemplates ?? []).map(template => ({ kind: TemplateCatalogKind.ScreenTemplate, template })),
            ...(source.dialogTemplates ?? []).map(template => ({ kind: TemplateCatalogKind.DialogTemplate, template })),
        ];

        for (const { kind, template } of templates) {
            const metadata = template.metadata;
            const describable = template as { displayName?: string; description?: string };
            const problems = validateTemplateMetadata(template.name, metadata);
            const warnings: string[] = [];
            const missingCategory = validateTemplateCategory(template.name, metadata);
            if (missingCategory) (source.manifest.kind === PackageKind.Blueprint ? problems : warnings).push(missingCategory);
            problems.push(...requirementProblems(template.name, metadata, versions, sceneVersion));

            entries.push({
                package: source.manifest.name,
                packageVersion: source.manifest.version,
                kind,
                name: template.name,
                displayName: describable.displayName,
                description: describable.description,
                type: metadata?.type,
                category: metadata?.category,
                scopes: metadata?.scopes,
                sliceKinds: metadata?.sliceKinds,
                compatibility: metadata?.compatibility,
                attribution: metadata?.attribution,
                license: metadata?.license,
                licenseUrl: metadata?.licenseUrl,
                compatible: problems.length === 0,
                problems,
                warnings,
            });
        }
    }

    return entries;
}

function requirementProblems(
    name: string,
    metadata: TemplateMetadata | undefined,
    versions: Map<string, string>,
    sceneVersion: string | undefined,
): string[] {
    const problems: string[] = [];
    const compatibility = metadata?.compatibility;
    if (!compatibility) return problems;

    if (sceneVersion !== undefined && compatibility.scene?.trim() && !isVersionSatisfiedBy(sceneVersion, compatibility.scene)) {
        problems.push(`Template '${name}' requires Scene ${compatibility.scene} but the host runs ${sceneVersion}`);
    }

    for (const requirement of compatibility.packages ?? []) {
        if (!requirement.name?.trim()) continue;
        // A template may require a package its owner does not depend on: that requirement is opt-in, and the template is
        // available only while the host or profile provides the package. The checks below make it unavailable otherwise.
        const version = versions.get(requirement.name);
        if (version === undefined) {
            problems.push(`Template '${name}' requires package '${requirement.name}', which this profile does not include. Add \`packages ${requirement.name}\` to the ui profile, or use a template that does not need it.`);
        } else if (!isVersionSatisfiedBy(version, requirement.versionRange)) {
            problems.push(`Template '${name}' requires package '${requirement.name}' ${requirement.versionRange} but version ${version} is available`);
        }
    }

    return problems;
}
