// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ApplicableBlueprint, ApplicableTemplate, ApplicableTemplateGroup, ApplicableTemplateSet } from '@cratis/scene.engine';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { CascadeEntry, CascadeEntryKind } from '../CascadeMenu';
import { TemplateReference } from '../ScreenTemplates/TemplateReference';
import { TemplateReferenceKind } from '../ScreenTemplates/TemplateReferenceKind';
import { TemplatePickerHandlers } from './TemplatePickerHandlers';
import { TemplatePickerLabels } from './TemplatePickerLabels';
import { templateMatchesFilter } from './templateMatchesFilter';

const separator = (id: string): CascadeEntry => ({ kind: CascadeEntryKind.Separator, id, label: '' });

/** The separator between the two names in a blueprint's category heading: `CRM · Workspace`. */
export const blueprintCategorySeparator = ' · ';

/** Whether a template is the one in effect. */
export function isCurrentTemplate(template: ApplicableTemplate, current: TemplateReference | undefined): boolean {
    if (!current) return false;
    const kind = template.reference.source === TemplateReferenceSource.Own ? TemplateReferenceKind.Application : TemplateReferenceKind.Blueprint;
    return kind === current.kind && template.reference.id.toLowerCase() === current.id.toLowerCase();
}

/**
 * The rows of the template picker, from what Scene says applies at the target.
 *
 * The user's own templates come first, directly, grouped by category with a check on the one in effect; the blueprints
 * are always one level deeper (`Blueprints ▸`, then the blueprint, then its templates grouped as
 * `Blueprint · Category`), and a blueprint with nothing applicable is not in the set at all, so it is never listed
 * (spec TPL2). The footer holds "Browse all…", "New template from current…" and "Clear template". Nothing here decides what applies:
 * a template that is not in the set is not shown, and one that is, is.
 *
 * @param set What applies at the target - Scene's `applicableTemplates`.
 * @param current The template in effect, if any.
 * @param filter What was typed into the filter.
 * @param labels The labels to use.
 * @param handlers What choosing does.
 * @returns The rows of the first panel.
 */
export function describeTemplatePicker(set: ApplicableTemplateSet, current: TemplateReference | undefined, filter: string, labels: TemplatePickerLabels, handlers: TemplatePickerHandlers): CascadeEntry[] {
    const item = (template: ApplicableTemplate, id: string, blueprint?: string): CascadeEntry => ({
        kind: CascadeEntryKind.Item,
        id,
        label: template.displayName ?? template.name,
        checked: isCurrentTemplate(template, current),
        actions: [
            ...(handlers.onPreview ? [{ label: labels.preview, closes: true, onActivate: () => handlers.onPreview!(template) }] : []),
            ...(blueprint !== undefined && handlers.onCopyToMine ? [{ label: labels.copyToMine, closes: true, onActivate: () => handlers.onCopyToMine!(template) }] : []),
        ],
        onActivate: () => handlers.onChoose(template),
    });

    const own = narrowGroups(set.own, undefined, filter);
    const withHeadings = own.length > 1 || own.some(group => group.category !== undefined);
    const ownEntries: CascadeEntry[] = own.flatMap((group, index): CascadeEntry[] => [
        ...(withHeadings ? [{ kind: CascadeEntryKind.Subheading, id: `own-category-${index}`, label: group.category ?? labels.uncategorized } as CascadeEntry] : []),
        ...group.templates.map(template => item(template, `own:${template.reference.id}`)),
    ]);

    const blueprints = set.blueprints
        .map(blueprint => ({ blueprint, categories: narrowGroups(blueprint.categories, blueprint.blueprint, filter) }))
        .filter(entry => entry.categories.length > 0);
    const blueprintEntries: CascadeEntry[] = blueprints.length === 0 ? [] : [{
        kind: CascadeEntryKind.Submenu,
        id: 'blueprints',
        label: labels.blueprints,
        entries: [
            { kind: CascadeEntryKind.Heading, id: 'blueprints-heading', label: labels.blueprints },
            ...blueprints.map(({ blueprint, categories }): CascadeEntry => ({
                kind: CascadeEntryKind.Submenu,
                id: `blueprint:${blueprint.blueprint}`,
                label: blueprintName(blueprint),
                entries: categories.flatMap((group, index): CascadeEntry[] => [
                    { kind: CascadeEntryKind.Heading, id: `blueprint:${blueprint.blueprint}:category-${index}`, label: [blueprintName(blueprint), group.category ?? labels.uncategorized].join(blueprintCategorySeparator) },
                    ...group.templates.map(template => item(template, `blueprint:${blueprint.blueprint}:${template.reference.id}`, blueprint.blueprint)),
                ]),
            })),
        ],
    }];

    // "Browse all…" is the way into the template browser, where every template and every blueprint - in the profile or not - can be seen, previewed and chosen.
    const footer: CascadeEntry[] = [
        ...(handlers.onBrowseAll ? [{ kind: CascadeEntryKind.Item, id: 'browse-all', label: labels.browseAll, onActivate: handlers.onBrowseAll } as CascadeEntry] : []),
        ...(handlers.onNewFromCurrent ? [{ kind: CascadeEntryKind.Item, id: 'new-from-current', label: `+ ${labels.newFromCurrent}`, onActivate: handlers.onNewFromCurrent } as CascadeEntry] : []),
        ...(handlers.onClear ? [{ kind: CascadeEntryKind.Item, id: 'clear', label: labels.clear, onActivate: handlers.onClear } as CascadeEntry] : []),
    ];

    const nothing = ownEntries.length === 0 && blueprints.length === 0;
    return [
        ...(ownEntries.length > 0 ? [{ kind: CascadeEntryKind.Heading, id: 'my-templates', label: labels.myTemplates } as CascadeEntry, ...ownEntries] : []),
        ...(nothing ? [{ kind: CascadeEntryKind.Note, id: 'nothing-applies', label: labels.nothingApplies } as CascadeEntry] : []),
        ...(blueprintEntries.length > 0 ? [...(ownEntries.length > 0 ? [separator('blueprints-separator')] : []), ...blueprintEntries] : []),
        ...(footer.length > 0 ? [separator('footer-separator'), ...footer] : []),
    ];
}

function blueprintName(blueprint: ApplicableBlueprint): string {
    return blueprint.displayName ?? blueprint.blueprint;
}

function narrowGroups(groups: ApplicableTemplateGroup[], blueprint: string | undefined, filter: string): ApplicableTemplateGroup[] {
    return groups
        .map(group => ({ ...group, templates: group.templates.filter(template => templateMatchesFilter(template, blueprint, filter)) }))
        .filter(group => group.templates.length > 0);
}
