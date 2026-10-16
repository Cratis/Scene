// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What activating a navigation item does in a host.
 *
 * - `navigate`: the item's destination is opened in its slot - what an end user, and a preview, expect.
 * - `select`: the item is only reported to the host (`onActivate`) and nothing is opened - what a design host wants when the author
 *   clicked to select the item for editing, not to go there.
 */
export type NavigationMode = 'navigate' | 'select';
