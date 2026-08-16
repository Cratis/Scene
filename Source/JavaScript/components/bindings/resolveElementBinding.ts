// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { stringProperty } from '../properties';
import { BindingKind } from './BindingKind';
import { ElementBinding } from './ElementBinding';
import { resolveCommand, resolveQuery } from './bindingRegistry';

/**
 * The property an element carries its binding name in, per kind. Queries and commands use different
 * property names so a single element could in principle carry both - a command dialog launched from a
 * data page, say - without the two names colliding.
 */
const bindingPropertyNames: Record<BindingKind, string> = {
    [BindingKind.Query]: 'query',
    [BindingKind.Command]: 'command',
};

/**
 * Reads the binding name an element carries for the given kind and looks it up in the binding registry.
 *
 * Every Arc-bound adapter starts here, so the "name in, class out" step happens in exactly one place and
 * every adapter reports a missing binding the same way. Nothing throws: an absent property and an
 * unregistered name both come back as an {@link ElementBinding} with no `target`, which the adapter
 * turns into a visible placeholder.
 */
export function resolveElementBinding(element: ExternalComponent, kind: BindingKind): ElementBinding {
    const name = stringProperty(element.properties, bindingPropertyNames[kind]);
    if (name === undefined) return {};

    return { name, target: kind === BindingKind.Query ? resolveQuery(name) : resolveCommand(name) };
}
