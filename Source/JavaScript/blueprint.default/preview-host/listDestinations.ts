// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, DestinationReference, ScreenTemplate } from '@cratis/scene.model';
import { ApplicationDocument } from './ApplicationDocument';

/** The groups a host's *Showing* picker lists destinations under. */
export enum DestinationGroup {
    /** The application's screens that fill the shell. */
    Pages = 'Pages',

    /** The dialog templates, opened over the page. */
    Dialogs = 'Dialogs',

    /** The screens whose template is a standard state: error, access denied, not found, empty. */
    States = 'States',
}

/** One place the host can show. */
export interface ListedDestination {
    /** Stable id within the list: `page:<screen>`, `state:<screen>`, `dialog:<template>`. */
    id: string;

    /** What the picker says. */
    label: string;

    group: DestinationGroup;

    /** The template's category (`Foundation / Dashboard`) or the screen's template name, for a picker that sub-groups. */
    category?: string;

    /** The destination to navigate the host's history to. */
    destination: DestinationReference;

    /** The screen's layout; the full-page shell for a sign-in or status screen. */
    layout?: string;

    /** The template's description, for a tooltip. */
    description?: string;
}

/** Destinations in the order a picker lists them, grouped. */
export interface DestinationGroupListing {
    group: DestinationGroup;
    destinations: ListedDestination[];
}

const isState = (template: ScreenTemplate | undefined) => /(^|\/)\s*state$/i.test(template?.metadata?.category ?? '');

/**
 * Every place an application can be shown (spec N3, N5): its pages, the dialogs and the standard states, grouped for the *Showing*
 * picker. The list is the document's own screens and dialog templates - for an application built on a blueprint with no authored
 * structure that is the blueprint's gallery (`galleryApplication`) - so what the picker offers is exactly what the host can
 * navigate to, and a destination from it is a valid input to `initialDestination` and to the navigation context.
 *
 * Nothing is listed that the host cannot render, and an empty group is left out. Order is the document's, so a designer sees the
 * pages the way they declared them.
 *
 * @param application The document the host renders.
 * @returns The groups, `Pages` then `States` then `Dialogs`.
 */
export function listDestinations(application: ApplicationDocument): DestinationGroupListing[] {
    const templates = new Map(application.screenTemplates.map(template => [template.name, template]));
    const pages: ListedDestination[] = [];
    const states: ListedDestination[] = [];

    for (const screen of application.screens) {
        const template = screen.screenTemplate === undefined ? undefined : templates.get(screen.screenTemplate);
        const state = isState(template);
        const listed: ListedDestination = {
            id: `${state ? 'state' : 'page'}:${screen.name}`,
            label: template?.displayName ?? screen.name,
            group: state ? DestinationGroup.States : DestinationGroup.Pages,
            category: template?.metadata?.category ?? screen.screenTemplate,
            destination: { kind: DestinationKind.Outlet, screen: screen.name },
            layout: screen.layout,
            ...(template?.description === undefined ? {} : { description: template.description }),
        };
        (state ? states : pages).push(listed);
    }

    const dialogs = (application.dialogTemplates ?? []).map((template): ListedDestination => ({
        id: `dialog:${template.name}`,
        label: template.displayName ?? template.name,
        group: DestinationGroup.Dialogs,
        category: template.metadata?.category,
        destination: { kind: DestinationKind.Dialog, dialog: template.name },
        ...(template.description === undefined ? {} : { description: template.description }),
    }));

    return [
        { group: DestinationGroup.Pages, destinations: pages },
        { group: DestinationGroup.States, destinations: states },
        { group: DestinationGroup.Dialogs, destinations: dialogs },
    ].filter(listing => listing.destinations.length > 0);
}
