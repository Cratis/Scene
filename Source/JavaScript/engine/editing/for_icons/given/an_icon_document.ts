// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    CollectionOperation, ComponentDescriptor, EditingScopeKind, PropertyValueType, SceneDocument, Screen, ScreenTemplate,
} from '@cratis/scene.model';
import { createDescriptorCatalog, EditingContext } from '../../../index';
import { EffectiveIconCatalog } from '../../../icons/EffectiveIconCatalog';
import { alphaName, betaName } from '../../../icons/for_iconFixtures/iconFixtures';
import { component, shell } from '../../given/a_scene_document';

export const iconBarDescriptor: ComponentDescriptor = {
    component: 'test:iconBar',
    properties: [
        { path: 'logo', label: 'Logo', group: 'Content', valueType: PropertyValueType.Icon, editorKind: 'iconPicker' },
        {
            path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection,
            item: {
                label: 'Item',
                properties: [
                    { path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String, constraints: { required: true } },
                    { path: 'icon', label: 'Icon', group: 'Content', valueType: PropertyValueType.Icon, editorKind: 'iconPicker' },
                ],
            },
        },
    ],
};

export const iconCatalog = createDescriptorCatalog([iconBarDescriptor]);

/** The icon the template author chose, from the first synthetic library. */
export const ownerLogo = { library: alphaName, key: 'home', variant: 'solid' };

/**
 * A `Module` template with an icon bar whose logo and items it exposes, and two screens - `Invoices` and
 * `Customers` - that fill it directly.
 */
export function createIconDocument(): SceneDocument {
    const module: ScreenTemplate = {
        name: 'Module',
        fitsSlot: 'content',
        slots: [{ name: 'chrome' }],
        content: { chrome: [component('bar', 'test:iconBar', { logo: ownerLogo, items: [{ id: 'start', label: 'Start', icon: { library: alphaName, key: 'home' } }] })] },
    };
    const screen = (name: string): Screen => ({ name, layout: 'Shell', screenTemplate: 'Module', forms: [], contributions: [], slotContent: {} });

    return {
        layouts: [shell],
        screenTemplates: [module],
        dialogTemplates: [],
        screens: [screen('Invoices'), screen('Customers')],
        exposures: [
            {
                owner: 'Module',
                properties: [
                    { component: 'bar', path: 'logo' },
                    { component: 'bar', path: 'items', operations: [CollectionOperation.Add, CollectionOperation.Remove, CollectionOperation.EditFields], editableFields: ['label', 'icon'] },
                ],
            },
        ],
        instanceContributions: [],
    };
}

export function iconContext(screen: string, icons?: EffectiveIconCatalog): EditingContext {
    return { catalog: iconCatalog, scope: { kind: EditingScopeKind.Screen, name: screen, layout: 'Shell' }, iconCatalog: icons };
}

export { alphaName, betaName };
