// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { externalComponent } from '@cratis/scene.blueprint.default';
import { ComponentName } from '../ComponentName';
import { CompositeName } from '../CompositeName';
import { ArcHeaderOptions } from './ArcHeaderOptions';

/**
 * The page furniture every template in this package repeats.
 *
 * `externalComponent` is imported from the default blueprint rather than written again, and that is worth
 * pausing on: `ExternalComponent` inherits fifteen required members before it reaches the two a template
 * author cares about, so a package that redeclared those defaults would be maintaining a second copy of a
 * decision it does not own. Borrowing the builder is the same choice as depending on the shell - this
 * blueprint layers on the default one, so it uses its parts.
 */

/**
 * This blueprint's page header, given its heading and the one binding the page is about.
 *
 * Every template opens with one. The header derives the trail and the design-time binding state itself, so
 * a template states the page's subject once instead of repeating it in a title, a trail and a table.
 */
export function arcPageHeader(id: string, options: ArcHeaderOptions, actions: SceneElement[] = []): SceneElement {
    return externalComponent(id, ComponentName.ArcPageHeader, { ...options }, { actions });
}

/**
 * The library's `page` primitive wrapping content.
 *
 * A `div` would have done structurally, and would have been wrong: `page` is the full-height flex column
 * every other component in `@cratis/components` is laid out inside, drawn from the same `--cratis-*`
 * tokens as the tables and dialogs it contains. Content wrapped in it gets that consistency for free, and
 * content wrapped in a `div` has to reinvent it and will drift.
 */
export function page(id: string, title: string, content: SceneElement[], panel = true): SceneElement {
    return externalComponent(id, CompositeName.Page, { title, showTitle: title.length > 0, panel }, { content });
}

/** One button in a tool palette. `title` is the accessible name as well as the tooltip, so it is never omitted. */
export function toolbarButton(id: string, title: string, icon: string, text?: string): SceneElement {
    return externalComponent(id, CompositeName.ToolbarButton, { title, icon, text });
}

/** Related buttons kept together inside a toolbar. */
export function toolbarGroup(id: string, buttons: SceneElement[]): SceneElement {
    return externalComponent(id, CompositeName.ToolbarGroup, { orientation: 'horizontal' }, { content: buttons });
}

/** The divider between groups of tools. */
export function toolbarSeparator(id: string): SceneElement {
    return externalComponent(id, CompositeName.ToolbarSeparator, { orientation: 'horizontal' });
}

/**
 * A horizontal tool palette.
 *
 * `draggable` is deliberately left off rather than set per button - it is a property of the palette, and
 * setting it per button is how you end up with a palette that is half draggable.
 */
export function toolbar(id: string, content: SceneElement[]): SceneElement {
    return externalComponent(id, CompositeName.Toolbar, { orientation: 'horizontal' }, { content });
}

/**
 * Scopes a failure to one region of a page.
 *
 * React's default is that a throw anywhere unmounts the whole tree, which on a composed screen means one
 * broken widget takes the navigation with it. Which regions deserve a boundary is a decision about the
 * page, which is exactly why it belongs in a template rather than in the renderer.
 */
export function errorBoundary(id: string, content: SceneElement[]): SceneElement {
    return externalComponent(id, CompositeName.ErrorBoundary, {}, { content });
}

/** An icon, given a PrimeIcons class name. */
export function icon(id: string, iconName: string): SceneElement {
    return externalComponent(id, CompositeName.Icon, { icon: iconName });
}
