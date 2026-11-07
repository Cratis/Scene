// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationReference } from '../common/DestinationReference';
import { OutletBuiltInAction } from './OutletBuiltInAction';
import { OutletItemBase } from './OutletItemBase';
import { OutletSubject } from './OutletSubject';
import { Opens } from './Opens';

/**
 * What a button and a menu entry share: a title and what happens when it is chosen. An action runs exactly one of a
 * slice (a hook), a navigation target or a built-in.
 */
export interface OutletAction extends OutletItemBase {
    /** The text shown. */
    title: string;

    /** Qualified icon reference, when the action has one. */
    icon?: string;

    /** The qualified id of the State Change slice the action runs, for example `catalog.products.SetProductPrice`. */
    slice?: string;

    /**
     * The command a hand-authored action names instead of a slice; the engine turns it into the one slice that accepts
     * the command.
     */
    command?: string;

    /** Where the action navigates to, when it navigates instead of running a slice. */
    navigateTo?: DestinationReference;

    /**
     * The built-in the action runs instead of a slice or a navigation target. Named `builtIn`, not `runs`: in Screenplay
     * `runs` means running a slice directly ({@link Opens.None}).
     */
    builtIn?: OutletBuiltInAction;

    /** Where the slice's screen opens; automatic when absent. */
    opens?: Opens;

    /** The slot the slice's screen opens in, when {@link opens} is a slot. */
    opensIn?: string;

    /** What the action acts on; the outlet's subject when absent. */
    subject?: OutletSubject;

    /** The condition under which the action is enabled, such as `item.status == "onSale"`. */
    enabledWhen?: string;

    /** The question asked before the action runs, when it asks one. */
    confirm?: string;

    /** The policy a user must satisfy to see the action. */
    authorize?: string;
}

/** The own property names of {@link OutletAction}, checked against the shared shape manifest. */
export const OutletActionPropertyNames: (keyof OutletAction)[] = [
    'title', 'icon', 'slice', 'command', 'navigateTo', 'builtIn', 'opens', 'opensIn', 'subject', 'enabledWhen', 'confirm', 'authorize',
];
