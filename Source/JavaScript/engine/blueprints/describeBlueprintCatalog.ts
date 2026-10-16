// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, TemplateRole } from '@cratis/scene.model';
import { TemplateSource } from '../templates/TemplateSource';
import { BlueprintCatalogEntry, BlueprintCatalogFile } from './BlueprintCatalogEntry';

/**
 * Describes every domain blueprint among the given packages - those of kind Blueprint that declare blueprint metadata - for a gallery:
 * its thumbnail and description, its screen set in navigation order, the templates it provides, and the sample data a preview can use.
 * A package that only provides foundation layouts and templates is not a domain blueprint and is not listed. The result is ordered by
 * package name so the file it is written to is stable. The C# engine (`BlueprintCatalog.Describe`) returns the same entries; both are
 * asserted against `blueprint-verification-fixtures.json`.
 */
export function describeBlueprintCatalog(sources: readonly TemplateSource[]): BlueprintCatalogEntry[] {
    return sources
        .filter(source => source.manifest.kind === PackageKind.Blueprint && source.manifest.blueprint !== undefined)
        .map((source): BlueprintCatalogEntry => {
            const manifest = source.manifest;
            const blueprint = manifest.blueprint!;
            const defaultId = blueprint.defaultSampleData ?? ((manifest.sampleData ?? []).length === 1 ? manifest.sampleData![0].id : undefined);
            const templates = [
                ...(source.layouts ?? []).map(template => ({ kind: 'Layout', template })),
                ...(source.screenTemplates ?? []).map(template => ({ kind: 'ScreenTemplate', template })),
                ...(source.dialogTemplates ?? []).map(template => ({ kind: 'DialogTemplate', template })),
            ];

            return {
                package: manifest.name,
                version: manifest.version,
                domain: blueprint.domain,
                ...(manifest.displayName === undefined ? {} : { displayName: manifest.displayName }),
                description: blueprint.description,
                thumbnail: blueprint.thumbnail,
                ...(manifest.license === undefined ? {} : { license: manifest.license }),
                ...(manifest.licenseUrl === undefined ? {} : { licenseUrl: manifest.licenseUrl }),
                dependencies: manifest.dependencies.map(dependency => ({ name: dependency.name, ...(dependency.versionRange === undefined ? {} : { versionRange: dependency.versionRange }) })),
                screens: orderedScreens(blueprint.screenSet ?? []).map(screen => ({
                    name: screen.name,
                    title: screen.title,
                    ...(screen.description === undefined ? {} : { description: screen.description }),
                    ...(screen.template === undefined ? {} : { template: screen.template }),
                    ...(screen.parent === undefined ? {} : { parent: screen.parent }),
                    ...(screen.order === undefined ? {} : { order: screen.order }),
                })),
                templates: templates.map(({ kind, template }) => {
                    const described = template as { displayName?: string; description?: string; slots?: { name: string }[]; metadata?: { type?: string; category?: string; thumbnail?: string; role?: string; primaryOutlet?: string } };
                    const isShell = kind === 'Layout' || described.metadata?.role === TemplateRole.Root;
                    return {
                        name: template.name,
                        kind,
                        ...(described.displayName === undefined ? {} : { displayName: described.displayName }),
                        ...(described.description === undefined ? {} : { description: described.description }),
                        ...(described.metadata?.type === undefined ? {} : { type: described.metadata.type }),
                        ...(described.metadata?.category === undefined ? {} : { category: described.metadata.category }),
                        ...(described.metadata?.thumbnail === undefined ? {} : { thumbnail: described.metadata.thumbnail }),
                        ...(isShell ? { outlets: (described.slots ?? []).map(slot => slot.name) } : {}),
                        ...(isShell && described.metadata?.primaryOutlet !== undefined ? { primaryOutlet: described.metadata.primaryOutlet } : {}),
                        ...(described.metadata?.role === undefined ? {} : { role: described.metadata.role }),
                    };
                }),
                sampleData: (manifest.sampleData ?? []).map(reference => ({ id: reference.id, title: reference.title, locale: reference.locale, path: reference.path, default: reference.id === defaultId })),
            };
        })
        .sort((left, right) => (left.package < right.package ? -1 : left.package > right.package ? 1 : 0));
}

/** The catalog as the file a blueprint package ships. */
export const toBlueprintCatalogFile = (entries: BlueprintCatalogEntry[]): BlueprintCatalogFile => ({ schema: 1, blueprints: entries });

/**
 * Puts screens in navigation order: siblings by `order` (a screen without one keeps its written place after those with one), each
 * screen directly followed by its children, so a flat list reads top to bottom as the navigation does.
 */
function orderedScreens<T extends { name: string; parent?: string; order?: number }>(screens: readonly T[]): T[] {
    const names = new Set(screens.map(screen => screen.name));
    const childrenOf = (parent: string | undefined): T[] => {
        const siblings = screens.filter(screen => (parent === undefined ? screen.parent === undefined || !names.has(screen.parent) : screen.parent === parent));
        return siblings
            .map((screen, index) => ({ screen, index }))
            .sort((left, right) => (left.screen.order ?? Number.MAX_SAFE_INTEGER) - (right.screen.order ?? Number.MAX_SAFE_INTEGER) || left.index - right.index)
            .map(entry => entry.screen);
    };

    const result: T[] = [];
    const seen = new Set<string>();
    const walk = (level: T[]) => {
        for (const screen of level) {
            if (seen.has(screen.name)) continue;
            seen.add(screen.name);
            result.push(screen);
            walk(childrenOf(screen.name));
        }
    };

    walk(childrenOf(undefined));
    for (const screen of screens) if (!seen.has(screen.name)) result.push(screen);
    return result;
}
