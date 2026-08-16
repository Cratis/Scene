// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The application shells this package provides.
 *
 * Only true application-level shells are layouts. Everything else this package ships - dashboards, CRUD
 * lists, sign-in screens - is a page or dialog template that *fits into* one of these, not a layout of its
 * own. Keeping the distinction in the type means the manifest's `layouts` list cannot quietly grow into a
 * catalog of pages.
 */
export enum LayoutName {
    /** Topbar, sidebar, breadcrumb, content, footer and an optional right panel - the shell an application signs in to. */
    AppShell = 'AppShell',

    /** No chrome at all: content, an optional branding aside, and the configurator. */
    FullPage = 'FullPage',
}
