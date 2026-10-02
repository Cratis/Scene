// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What is being edited. It decides what counts as local and what is inherited.
 */
export enum EditingScopeKind {
    Screen = 'screen',
    ScreenTemplate = 'screenTemplate',
    DialogTemplate = 'dialogTemplate',
    Layout = 'layout',
}
