// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPackReference, SampleStatusClassification, ScenePackage } from '@cratis/scene.model';
import { genericSampleDataColumns, genericSampleDataDescription, genericSampleDataStatusColumn, genericSampleDataStatuses } from './sampleStatus';
import { SampleDataPackSource } from './SampleDataPackSource';
import { validateSampleDataPackages } from './validateSampleDataPackages';

/** The separator between blueprint and pack in a label (`CRM · Nordic SMB`). */
export const sampleDataLabelSeparator = ' \u00b7 ';

/** One entry of the sample data selector. */
export interface SampleDataCatalogEntry {
    /** The pack identity a selection stores as `activePack`; empty for the generated entry. */
    id: string;

    /** Whether this is the generated entry, the choice that stores no active pack. */
    isGenerated: boolean;

    /** The pack's name within its group (`Nordic SMB`). */
    name: string;

    /** The full label (`CRM · Nordic SMB`, or just the name for generated and own packs). */
    label: string;

    /** The locale tag, absent for the generated entry. */
    locale?: string;

    /** Whether it is the active pack (the generated entry is selected when no pack is active). */
    selected: boolean;

    /** One line saying what the pack is. */
    description?: string;

    /** The columns of the pack's main table, in order. */
    columns?: string[];

    /** The column drawn as status pills. */
    statusColumn?: string;

    /** The classification of the status column's values. */
    statuses?: SampleStatusClassification;
}

/** A blueprint's packs, one group of the Blueprints submenu. */
export interface SampleDataCatalogGroup {
    /** The blueprint's display name (`CRM`). */
    blueprint: string;

    packs: SampleDataCatalogEntry[];
}

/** The selector's content: generated, the author's own sets, then blueprint groups. */
export interface SampleDataCatalog {
    /** `Generic (typed by field kind)`. */
    generated: SampleDataCatalogEntry;

    /** The author's own data sets, in the order given. */
    own: SampleDataCatalogEntry[];

    /** Blueprints that ship at least one pack, in package order; blueprints with none are not listed. */
    blueprints: SampleDataCatalogGroup[];

    /** Problems found validating what the packages ship. */
    problems: string[];
}

/** The name of the generated entry. */
export const generatedSampleDataName = 'Generic (typed by field kind)';

/**
 * Describes the sample data selector's content: the generated entry first, then the author's own packs, then
 * each blueprint's packs grouped by the blueprint's display name (falling back to its package name). A pack
 * whose title already starts with `<Blueprint> · ` shows the rest as its name, so `CRM · Nordic SMB` under
 * `CRM` is `Nordic SMB`. Same own-first, then Blueprints menu pattern as the template picker (spec §11).
 *
 * @param sources The packages and the packs they ship (only their `sampleData` references are listed).
 * @param ownPacks The author's own packs (id, title, locale).
 * @param activePack The selection's active pack id, if any.
 */
export function describeSampleDataCatalog(
    sources: readonly SampleDataPackSource[],
    ownPacks: readonly (Pick<SampleDataPackReference, 'id' | 'title' | 'locale'> & Partial<SampleDataPackReference>)[] = [],
    activePack?: string,
): SampleDataCatalog {
    const entry = (id: string, name: string, label: string, locale: string, reference?: Partial<SampleDataPackReference>): SampleDataCatalogEntry => ({
        id, isGenerated: false, name, label, locale, selected: id === activePack,
        ...(reference?.description === undefined ? {} : { description: reference.description }),
        ...(reference?.columns === undefined ? {} : { columns: [...reference.columns] }),
        ...(reference?.statusColumn === undefined ? {} : { statusColumn: reference.statusColumn }),
        ...(reference?.statuses === undefined ? {} : { statuses: reference.statuses }),
    });

    const blueprints: SampleDataCatalogGroup[] = [];
    for (const source of sources) {
        const references = source.manifest.sampleData ?? [];
        if (references.length === 0) continue;
        const group = groupName(source.manifest);
        const prefix = `${group}${sampleDataLabelSeparator}`;
        blueprints.push({
            blueprint: group,
            packs: references.map(reference => {
                const name = reference.title.startsWith(prefix) ? reference.title.slice(prefix.length) : reference.title;
                return entry(reference.id, name, `${group}${sampleDataLabelSeparator}${name}`, reference.locale, reference);
            }),
        });
    }

    return {
        generated: {
            id: '',
            isGenerated: true,
            name: generatedSampleDataName,
            label: generatedSampleDataName,
            selected: activePack === undefined || activePack === null || activePack === '',
            description: genericSampleDataDescription,
            columns: [...genericSampleDataColumns],
            statusColumn: genericSampleDataStatusColumn,
            statuses: genericSampleDataStatuses,
        },
        own: ownPacks.map(pack => entry(pack.id, pack.title, pack.title, pack.locale, pack)),
        blueprints,
        problems: validateSampleDataPackages(sources),
    };
}

function groupName(manifest: ScenePackage): string {
    return manifest.displayName !== undefined && manifest.displayName.trim() !== '' ? manifest.displayName : manifest.name;
}
