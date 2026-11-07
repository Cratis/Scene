// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A built-in an action runs instead of a slice or a navigation target: Screenplay's `runs close | submit | refresh`.
 */
export enum OutletBuiltInAction {
    /** Close the dialog or drawer the action sits in. */
    Close = 'close',

    /** Submit the form of the dialog or drawer the action sits in. */
    Submit = 'submit',

    /** Run the queries of the screen again. */
    Refresh = 'refresh',
}
