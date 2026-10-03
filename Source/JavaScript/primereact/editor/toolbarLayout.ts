// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The formats the toolbar offers. Content in other formats is still shown, but cannot be produced here. */
export const toolbarLayout: (string | Record<string, unknown>)[][] = [
    ['bold', 'italic', 'underline'],
    [{ header: [1, 2, 3, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
];
