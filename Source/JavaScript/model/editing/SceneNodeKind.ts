// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What kind of node an id addresses.
 */
export enum SceneNodeKind {
    Layout = 'layout',
    ScreenTemplate = 'screenTemplate',
    DialogTemplate = 'dialogTemplate',
    Screen = 'screen',

    /** A named slot of a layout or template, or the content a screen puts in one. */
    Slot = 'slot',

    /** A scene element: a component, a panel, a control. */
    Element = 'element',

    /** A node of a flow arrangement: a row, a column, a grid or a leaf. */
    FlowNode = 'flowNode',

    /** A freeform arrangement. */
    Freeform = 'freeform',

    /** One element's (or slot's) placement within a freeform variant. */
    Placement = 'placement',
}
