// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BlueprintPinStatus, describeBlueprintCatalog, evaluateBlueprintPin, type BlueprintCatalogEntry } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { UiProfileSettings } from '../UiProfile/UiProfileSettings';
import { BlueprintInstallState } from './BlueprintInstallState';
import type { BlueprintGalleryCard, BlueprintTemplateGroup } from './BlueprintGalleryCard';
import type { BlueprintReferenceUse } from './BlueprintReferenceUse';
import type { BlueprintUpdate } from './BlueprintUpdate';

/** The order in which updates are worst: a reference whose pin no longer holds before one that is merely behind. */
const severity: Record<BlueprintPinStatus, number> = {
    [BlueprintPinStatus.Current]: 0,
    [BlueprintPinStatus.UpdateAvailable]: 1,
    [BlueprintPinStatus.UpdateBlockedByPin]: 2,
    [BlueprintPinStatus.NotSatisfied]: 3,
    [BlueprintPinStatus.Invalid]: 4,
};

/**
 * The cards of the blueprint gallery (spec 6, "preview data for the Studio gallery, description + thumbnail").
 *
 * What a blueprint is - its thumbnail, description, screen set, templates and sample data - is Scene's `describeBlueprintCatalog`, the same description
 * the `blueprintCatalog.json` each blueprint ships holds and both engines assert; nothing is described twice. Studio adds only what is Studio's: where
 * the blueprint stands in this application's UI profile, whether it matches what was typed, and - from the references that pin it - whether an update
 * is on offer, which is Scene's `evaluateBlueprintPin`.
 *
 * @param bundles The blueprint bundles this build has loaded.
 * @param profile The draft UI profile: its shell and template packs say what is added.
 * @param requiredBy The packages the profile pulls in only because another requires them (resolution's automatic entries).
 * @param references The application's template references that pin a blueprint.
 * @param filter What was typed into the gallery's filter; a card matches when every word is in its name, domain, description, a screen or a template.
 * @returns The cards, ordered by package name.
 */
export function describeBlueprintGallery(
    bundles: readonly ScenePackageBundle[],
    profile: Pick<UiProfileSettings, 'shell' | 'templatePacks'>,
    requiredBy: ReadonlySet<string> = new Set(),
    references: readonly BlueprintReferenceUse[] = [],
    filter = ''): BlueprintGalleryCard[] {
    const words = filter.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    return describeBlueprintCatalog(bundles)
        .map(entry => cardOf(entry, profile, requiredBy, references))
        .filter(card => matches(card, words));
}

function cardOf(entry: BlueprintCatalogEntry, profile: Pick<UiProfileSettings, 'shell' | 'templatePacks'>, requiredBy: ReadonlySet<string>, references: readonly BlueprintReferenceUse[]): BlueprintGalleryCard {
    const update = worstUpdate(entry, references.filter(reference => reference.package === entry.package));
    return {
        package: entry.package,
        name: entry.displayName ?? entry.package,
        version: entry.version,
        domain: entry.domain,
        description: entry.description,
        thumbnail: entry.thumbnail,
        ...(entry.license === undefined ? {} : { license: entry.license }),
        state: stateOf(entry.package, profile, requiredBy),
        dependencies: entry.dependencies,
        screens: entry.screens,
        templateGroups: groupTemplates(entry),
        templateCount: entry.templates.length,
        sampleData: [...entry.sampleData].sort((left, right) => Number(right.default) - Number(left.default)),
        ...(update === undefined ? {} : { update }),
    };
}

function stateOf(name: string, profile: Pick<UiProfileSettings, 'shell' | 'templatePacks'>, requiredBy: ReadonlySet<string>): BlueprintInstallState {
    if (profile.shell === name) return BlueprintInstallState.Shell;
    if (profile.templatePacks.includes(name)) return BlueprintInstallState.TemplatePack;
    return requiredBy.has(name) ? BlueprintInstallState.Required : BlueprintInstallState.Available;
}

function groupTemplates(entry: BlueprintCatalogEntry): BlueprintTemplateGroup[] {
    const groups = new Map<string, string[]>();
    for (const template of entry.templates) {
        const category = template.category ?? '';
        groups.set(category, [...(groups.get(category) ?? []), template.displayName ?? template.name]);
    }

    return [...groups].map(([category, templates]) => ({ category, templates }));
}

function worstUpdate(entry: BlueprintCatalogEntry, references: readonly BlueprintReferenceUse[]): BlueprintUpdate | undefined {
    let worst: BlueprintUpdate | undefined;
    for (const reference of references) {
        const evaluation = evaluateBlueprintPin(reference.pin, reference.version, entry.version);
        if (evaluation.status === BlueprintPinStatus.Current) continue;
        if (worst === undefined || severity[evaluation.status] > severity[worst.status]) {
            worst = { status: evaluation.status, from: reference.version, to: entry.version, pin: evaluation.pin, message: evaluation.message };
        }
    }

    return worst;
}

function matches(card: BlueprintGalleryCard, words: readonly string[]): boolean {
    if (words.length === 0) return true;
    const haystack = [card.name, card.package, card.domain, card.description, ...card.screens.map(screen => screen.title), ...card.templateGroups.flatMap(group => [group.category, ...group.templates])].join('\n').toLowerCase();
    return words.every(word => haystack.includes(word));
}
