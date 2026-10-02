// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScope, EditingScopeKind } from '@cratis/scene.model';

const separator = '#';

function child(parentId: string, segment: string): string {
    return [parentId, segment].join(separator);
}

/**
 * The id of a layout node.
 */
export function layoutNodeId(name: string): string {
    return `layout:${name}`;
}

/**
 * The id of a screen template node.
 */
export function screenTemplateNodeId(name: string): string {
    return `screenTemplate:${name}`;
}

/**
 * The id of a dialog template node.
 */
export function dialogTemplateNodeId(name: string): string {
    return `dialogTemplate:${name}`;
}

/**
 * The id of a screen node.
 */
export function screenNodeId(name: string): string {
    return `screen:${name}`;
}

/**
 * The id of a named slot of a layout, template or screen.
 */
export function slotNodeId(ownerNodeId: string, slotName: string): string {
    return child(ownerNodeId, `slot:${slotName}`);
}

/**
 * The id of an element. Element ids are unique across a document and survive moves, so this is the stable way to
 * address a component an author has placed.
 */
export function elementNodeId(elementId: string): string {
    return `element:${elementId}`;
}

/**
 * The id of the arrangement a layout, template or dialog positions its own slots with.
 */
export function ownerArrangementId(ownerNodeId: string): string {
    return child(ownerNodeId, 'arrangement');
}

/**
 * The id of a node of a flow arrangement.
 *
 * `holderId` is the slot or owner arrangement the flow belongs to, `variant` is `root` or `override<n>`, and
 * `indexPath` walks down from that variant's root through each container's children. A flow node has no identity
 * of its own, so the id is a structural address and only names the same node until the tree around it changes -
 * read it from the same revision of the document you act on.
 */
export function flowNodeId(holderId: string, variant: string, indexPath: number[]): string {
    return child(holderId, `flow:${[variant, ...indexPath].join('.')}`);
}

/**
 * The id of a freeform arrangement.
 */
export function freeformNodeId(holderId: string): string {
    return child(holderId, 'freeform');
}

/**
 * The id of one placement within a freeform variant. `key` is the placed element's id, or the placed slot's name.
 */
export function placementNodeId(holderId: string, variantIndex: number, key: string): string {
    return child(`${freeformNodeId(holderId)}:${variantIndex}`, `placement:${key}`);
}

/**
 * The node id of the thing an editing scope names.
 */
export function scopeNodeId(scope: EditingScope): string {
    switch (scope.kind) {
        case EditingScopeKind.Screen: return screenNodeId(scope.name);
        case EditingScopeKind.ScreenTemplate: return screenTemplateNodeId(scope.name);
        case EditingScopeKind.DialogTemplate: return dialogTemplateNodeId(scope.name);
        default: return layoutNodeId(scope.name);
    }
}

/**
 * The instance id an editing scope contributes under: `screen:<name>`, `template:<name>`, `dialog:<name>` or
 * `layout:<name>`. It is what an {@link InstanceContribution} is keyed by.
 */
export function scopeInstanceId(scope: EditingScope): string {
    switch (scope.kind) {
        case EditingScopeKind.Screen: return `screen:${scope.name}`;
        case EditingScopeKind.ScreenTemplate: return `template:${scope.name}`;
        case EditingScopeKind.DialogTemplate: return `dialog:${scope.name}`;
        default: return `layout:${scope.name}`;
    }
}
