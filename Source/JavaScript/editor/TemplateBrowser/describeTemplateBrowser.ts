// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    applicableTemplates,
    describeTemplateCatalog,
    TemplateCatalogKind,
    validateDialogTemplateForTarget,
    validateLayoutForTarget,
    validateScreenTemplateForTarget,
    type TemplateCatalogEntry,
    type TemplateSource,
    type TemplateTarget,
} from '@cratis/scene.engine';
import { describeBlueprintGallery } from '../BlueprintGallery/describeBlueprintGallery';
import type { BlueprintGalleryCard } from '../BlueprintGallery/BlueprintGalleryCard';
import { TemplateReferenceKind } from '../ScreenTemplates/TemplateReferenceKind';
import type { TemplateReference } from '../ScreenTemplates/TemplateReference';
import { allTemplatesRailId, blueprintRailId, ownTemplatesRailId, type TemplateBrowserRailItem } from './TemplateBrowserRailItem';
import { TemplateBrowserEmpty } from './TemplateBrowserEmpty';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import type { TemplateBrowserInput } from './TemplateBrowserInput';
import { TemplateBrowserMode } from './TemplateBrowserMode';
import type { TemplateBrowserModel } from './TemplateBrowserModel';
import { TemplateBrowserRailKind } from './TemplateBrowserRailKind';
import { TemplateOrigin } from './TemplateOrigin';

const keyOf = (packageName: string, kind: TemplateCatalogKind, name: string): string => `${packageName}|${kind}|${name}`;

/**
 * What the template browser shows: the application's own templates and every template of every blueprint the build ships, with where each stands.
 *
 * Nothing here decides what a template is or whether it fits. What a template is - its category, scopes, description, compatibility - is Scene's
 * `describeTemplateCatalog`; whether it fits the target, and why not, is Scene's `applicableTemplates` and the validators it is made of (the C# engine
 * returns the same answers); what a blueprint is - its thumbnail, description, version, whether an update waits - is the blueprint catalog the gallery already
 * reads. Studio adds only how they are laid out. On a dialog (spec TPL2) a template that does not fit is left out and counted; on the page it is kept, with
 * Scene's reasons, so the user can see why.
 *
 * @param input What the model is made of.
 * @returns The rail, the templates of the selected row, and why there are none when there are none.
 */
export function describeTemplateBrowser(input: TemplateBrowserInput): TemplateBrowserModel {
    // A template names the component packages it uses, and Scene's library calls it compatible only when they are available: the packages the build
    // ships take part as sources of no templates, so their versions are known to it.
    const listed = new Set(input.blueprints.map(source => source.manifest.name));
    const sources = [input.own, ...input.blueprints, ...input.bundles.filter(bundle => !listed.has(bundle.manifest.name)).map(bundle => ({ manifest: bundle.manifest }))];
    const cards = new Map(describeBlueprintGallery(input.bundles, input.profile, input.requiredBy, input.references).map(card => [card.package, card]));
    const catalog = describeTemplateCatalog(sources);
    const fits = input.target === undefined ? undefined : applicableKeys(input.own, input.blueprints, input.target);
    const reasons = input.target === undefined ? undefined : reasonsOf(sources, input.target);

    const everything = catalog.map(entry => entryOf(entry, input, cards, fits, reasons));
    const visible = input.mode === TemplateBrowserMode.Pick ? everything.filter(entry => entry.applicability.applies) : everything;
    const hidden = everything.length - visible.length;

    const matching = visible.filter(entry => matches(entry, input.filter));
    const rail = railOf(input, cards, matching, visible);
    const selectedRailId = rail.some(item => item.id === input.railId) ? input.railId : allTemplatesRailId;
    const inRow = matching.filter(entry => belongsTo(entry, selectedRailId));
    const categories = [...new Set(inRow.map(entry => entry.category).filter((category): category is string => category !== undefined))].sort((left, right) => left.localeCompare(right));
    const entries = inRow
        .filter(entry => input.category.length === 0 || entry.category === input.category)
        .sort((left, right) => order(left) - order(right) || (left.category ?? '').localeCompare(right.category ?? '') || left.displayName.localeCompare(right.displayName));

    return {
        rail,
        selectedRailId,
        entries,
        categories,
        hidden,
        ...(entries.length > 0 ? {} : { empty: emptyReason(input, selectedRailId, visible, rail) }),
    };
}

function order(entry: TemplateBrowserEntry): number {
    return entry.origin === TemplateOrigin.Own ? 0 : 1;
}

function applicableKeys(own: TemplateSource, blueprints: TemplateSource[], target: TemplateTarget): Set<string> {
    const set = applicableTemplates({ own, blueprints }, target);
    const keys = new Set<string>();
    for (const group of set.own) for (const template of group.templates) keys.add(keyOf(own.manifest.name, template.kind, template.name));
    for (const blueprint of set.blueprints) for (const group of blueprint.categories) for (const template of group.templates) keys.add(keyOf(template.package, template.kind, template.name));
    return keys;
}

function reasonsOf(sources: TemplateSource[], target: TemplateTarget): Map<string, string[]> {
    const reasons = new Map<string, string[]>();
    for (const source of sources) {
        const name = source.manifest.name;
        for (const layout of source.layouts ?? []) reasons.set(keyOf(name, TemplateCatalogKind.Layout, layout.name), validateLayoutForTarget(layout, target));
        for (const template of source.screenTemplates ?? []) reasons.set(keyOf(name, TemplateCatalogKind.ScreenTemplate, template.name), validateScreenTemplateForTarget(template, target));
        for (const template of source.dialogTemplates ?? []) reasons.set(keyOf(name, TemplateCatalogKind.DialogTemplate, template.name), validateDialogTemplateForTarget(template, target));
    }

    return reasons;
}

function entryOf(entry: TemplateCatalogEntry, input: TemplateBrowserInput, cards: Map<string, BlueprintGalleryCard>, fits: Set<string> | undefined, reasons: Map<string, string[]> | undefined): TemplateBrowserEntry {
    const own = entry.package === input.own.manifest.name;
    const card = cards.get(entry.package);
    const key = keyOf(entry.package, entry.kind, entry.name);
    const reference: TemplateReference = { kind: own ? TemplateReferenceKind.Application : TemplateReferenceKind.Blueprint, id: entry.name };
    const source = input.blueprints.find(candidate => candidate.manifest.name === entry.package);
    const thumbnail = [...(source?.screenTemplates ?? []), ...(source?.dialogTemplates ?? [])].find(template => template.name === entry.name)?.metadata?.thumbnail;

    return {
        id: `${own ? TemplateOrigin.Own : TemplateOrigin.Blueprint}:${entry.package}:${entry.kind}:${entry.name}`,
        origin: own ? TemplateOrigin.Own : TemplateOrigin.Blueprint,
        reference,
        kind: entry.kind,
        name: entry.name,
        displayName: entry.displayName ?? entry.name,
        ...(entry.description === undefined ? {} : { description: entry.description }),
        ...(entry.category === undefined ? {} : { category: entry.category }),
        ...(own ? {} : { package: entry.package, packageName: card?.name ?? source?.manifest.displayName ?? entry.package, packageVersion: entry.packageVersion }),
        scopes: entry.scopes ?? [],
        sliceKinds: entry.sliceKinds ?? [],
        ...(thumbnail === undefined ? {} : { thumbnail }),
        ...(entry.license === undefined ? {} : { license: entry.license }),
        // Compatibility, attribution and license are what a shipped template declares. The application's own templates are the author's own work: Scene's
        // metadata checks do not apply to them, and they run wherever the application runs.
        compatible: own || entry.compatible,
        problems: own ? [] : entry.problems,
        installed: own || input.active.has(entry.package),
        current: isCurrent(reference, input.current),
        applicability: { applies: fits === undefined || fits.has(key), reasons: reasons?.get(key) ?? [] },
        ...(card?.update === undefined ? {} : { update: card.update }),
    };
}

function isCurrent(reference: TemplateReference, current: TemplateReference | undefined): boolean {
    return current !== undefined && current.kind === reference.kind && current.id.toLowerCase() === reference.id.toLowerCase();
}

function matches(entry: TemplateBrowserEntry, filter: string): boolean {
    const words = filter.toLocaleLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return true;
    const haystack = [entry.displayName, entry.name, entry.description, entry.category, entry.packageName, entry.package, entry.kind].join('\n').toLocaleLowerCase();
    return words.every(word => haystack.includes(word));
}

function belongsTo(entry: TemplateBrowserEntry, railId: string): boolean {
    if (railId === allTemplatesRailId) return true;
    if (railId === ownTemplatesRailId) return entry.origin === TemplateOrigin.Own;
    return entry.package !== undefined && blueprintRailId(entry.package) === railId;
}

function railOf(input: TemplateBrowserInput, cards: Map<string, BlueprintGalleryCard>, matching: TemplateBrowserEntry[], visible: TemplateBrowserEntry[]): TemplateBrowserRailItem[] {
    const count = (railId: string) => matching.filter(entry => belongsTo(entry, railId)).length;
    const blueprints = input.blueprints
        // On a dialog a blueprint with nothing that fits is not worth a row; on the page every blueprint the build ships is.
        .filter(source => input.mode === TemplateBrowserMode.Manage || visible.some(entry => entry.package === source.manifest.name))
        .map((source): TemplateBrowserRailItem => {
            const card = cards.get(source.manifest.name);
            const railId = blueprintRailId(source.manifest.name);
            return {
                id: railId,
                kind: TemplateBrowserRailKind.Blueprint,
                label: card?.name ?? source.manifest.displayName ?? source.manifest.name,
                count: count(railId),
                installed: input.active.has(source.manifest.name),
                version: source.manifest.version,
                ...(card?.description === undefined ? {} : { description: card.description }),
                ...(card?.thumbnail === undefined ? {} : { thumbnail: card.thumbnail }),
                ...(card?.update === undefined ? {} : { update: card.update }),
            };
        });

    return [
        { id: allTemplatesRailId, kind: TemplateBrowserRailKind.All, label: '', count: matching.length, installed: true },
        { id: ownTemplatesRailId, kind: TemplateBrowserRailKind.Own, label: '', count: count(ownTemplatesRailId), installed: true },
        ...blueprints,
    ];
}

function emptyReason(input: TemplateBrowserInput, railId: string, visible: TemplateBrowserEntry[], rail: TemplateBrowserRailItem[]): TemplateBrowserEmpty {
    if (input.filter.trim().length > 0 || input.category.length > 0) return TemplateBrowserEmpty.NothingMatches;
    if (railId === ownTemplatesRailId) return visible.some(entry => entry.origin === TemplateOrigin.Own) ? TemplateBrowserEmpty.NothingApplies : TemplateBrowserEmpty.NothingYet;
    if (rail.find(item => item.id === railId)?.installed === false) return TemplateBrowserEmpty.NeedsBlueprint;
    return TemplateBrowserEmpty.NothingApplies;
}

