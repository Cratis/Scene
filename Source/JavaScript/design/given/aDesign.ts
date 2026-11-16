// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, DesignSystem, ScreenTemplate, SceneDocument } from '@cratis/scene.model';
import { DesignCatalogueInput, DesignWorkspace, createDesignContext, createScreenSet } from '../index';

const frame = () => ({
    visibility: 'Visible', isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 }, horizontalAlignment: 'Stretch', verticalAlignment: 'Stretch',
});

const text = (path: string, label: string) => ({ path, label, group: 'Content', valueType: 'string' });

export const descriptors = [
    {
        component: 'spec:button', displayName: 'Button', category: 'Actions',
        properties: [
            text('label', 'Label'),
            { path: 'variant', label: 'Variant', group: 'Look', valueType: 'enum', choices: [{ value: 'primary', label: 'Primary' }, { value: 'danger', label: 'Danger' }] },
        ],
        anatomy: { parts: ['background'], variants: ['primary', 'danger'], states: ['hover'] },
    },
    { component: 'spec:chart', displayName: 'Chart', category: 'Data display', properties: [text('title', 'Title')] },
    { component: 'spec:dialog', displayName: 'Dialog', category: 'Overlay', properties: [] },
] as unknown as ComponentDescriptor[];

export const templates = [
    { name: 'Page', slots: [{ name: 'actions' }, { name: 'body' }], content: { actions: [{ id: 'page-action', name: 'page-action', componentName: 'spec:button', properties: {}, slots: {}, ...frame() }], body: [] } },
    { name: 'Other', slots: [{ name: 'main' }], content: { main: [] } },
] as unknown as ScreenTemplate[];

export const designSystem: DesignSystem = {
    name: 'Spec', modes: ['light'], tokens: [{ category: 'color', name: 'primary' }],
    components: [{ name: 'Button', parts: ['background'], variants: [{ name: 'primary', parts: { background: 'color.primary' } }] }],
    themes: [{ name: 'Day', modes: [{ mode: 'light', tokens: { 'color.primary': '#112233' } }] }],
};

export const input = (extra: Partial<DesignCatalogueInput> = {}): DesignCatalogueInput => ({ descriptors, templates, designSystem, ...extra });

export const emptyDocument: SceneDocument = { layouts: [{ name: 'Shell', slots: [{ name: 'content' }] }] as SceneDocument['layouts'], screenTemplates: [], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] };

export const emptyWorkspace = (): DesignWorkspace => ({ document: structuredClone(emptyDocument), screenSet: createScreenSet() });

export const contextOf = (extra: Partial<DesignCatalogueInput> = {}) => createDesignContext(input(extra));
