// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { BindingKind } from './BindingKind';
import { Placeholder } from './Placeholder';

export interface MissingBindingProps {
    /** The element whose binding could not be satisfied. */
    element: ExternalComponent;

    /** Whether a query or a command was wanted. */
    kind: BindingKind;

    /**
     * The name the screen asked for, or `undefined` when the screen never named one. The two are
     * different mistakes and get different messages - a screen that names `AllInvoices` needs the host
     * to register it, while a screen that names nothing needs editing.
     */
    name?: string;
}

/**
 * The placeholder an Arc-bound adapter renders instead of its real component when the binding it needs
 * is not available.
 *
 * It names the binding, because that is the only actionable part: the fix is either to register that
 * name in the host or to correct the name in the screen, and the message has to be enough to tell those
 * two apart without opening a debugger.
 */
export function MissingBinding({ element, kind, name }: MissingBindingProps) {
    const problem = name === undefined ? `Missing ${kind} binding` : `Unresolved ${kind} binding '${name}'`;
    return <Placeholder element={element} problem={problem} />;
}
