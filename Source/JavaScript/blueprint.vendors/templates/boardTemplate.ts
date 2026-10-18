// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { boardScreenTemplate } from '@cratis/scene.blueprint.default';
import { VendorsEntityKind, VendorsQuery, fromQuery, localeOfData, vendorsQueriesOf } from '../vendorsQueries';
import { actionButton, component, vendorsMetadata, opensDialog, withBehaviors } from '../vendorsParts';

interface BoardOptions {
    name: string;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    searchLabel: string;
    label: string;
    entity: VendorsEntityKind;
    columns: string;
    cards: string;
    primary: { label: string; dialog: string };
}

/**
 * One board: the foundation `BoardScreen` with a column for each step and a card for each record. A card moves to another step by dragging or by its own Move-to menu,
 * and a column says in words when its limit is exceeded.
 */
function boardOf(options: BoardOptions): ScreenTemplate {
    const id = options.name;
    return {
        name: options.name,
        fitsSlot: 'content',
        slots: boardScreenTemplate.slots,
        arrangement: boardScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, {
                actions: [withBehaviors(actionButton(`${id}-new`, options.primary.label, 'primary'), opensDialog(options.primary.dialog))],
            })],
            toolbar: [
                component(`${id}-search`, 'globalSearch', { placeholder: options.searchLabel, label: options.searchLabel }),
                component(`${id}-views`, 'savedViewsMenu', { views: fromQuery(vendorsQueriesOf(options.entity).views), savePermission: 'enabled', managePermission: 'enabled' }),
            ],
            board: [component(`${id}-columns`, 'kanbanBoard', { columns: fromQuery(options.columns), cards: fromQuery(options.cards), editPermission: 'enabled', label: options.label, ...localeOfData })],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: vendorsMetadata(options.name, 'Board', [TemplateScope.Module, TemplateScope.Feature]),
    };
}

/** The onboarding board: a column for each step a vendor goes through and a card for each vendor with its category and country. */
export const vendorsOnboardingTemplate = boardOf({
    name: 'VendorsOnboardingBoard', displayName: 'Vendors onboarding board', description: 'Vendors as cards in a column for each onboarding step, moved by dragging or by menu.', title: 'Onboarding', subtitle: 'Drag a vendor to its next step', searchLabel: 'Search the board', label: 'Vendors by onboarding step',
    entity: VendorsEntityKind.Vendor, columns: VendorsQuery.OnboardingColumns, cards: VendorsQuery.OnboardingCards, primary: { label: 'New vendor', dialog: 'VendorsQuickCreateVendor' },
});
