// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';
import { HorizontalAlignment, PackageKind, VerticalAlignment, Visibility, type ComponentDescriptor, type ExternalComponent, type SceneDocument } from '@cratis/scene.model';
import { componentRegistryKey, DesignTimeContractVersion, type DesignTimeComponentProps, type ScenePackageBundle } from '@cratis/scene.react';
import { createDesignTimeHost } from '../../Runtime/createDesignTimeHost';
import { DesignTimeDesignersSection } from '../DesignTimeDesignersSection';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import type { ScreenEditorController } from '../../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../../Host/ScreenEditorHost';

const descriptor: ComponentDescriptor = { component: componentRegistryKey('Package', 'Widget'), displayName: 'Widget', editorKind: 'widgetDesigner', properties: [] };
const component: ExternalComponent = {
    id: 'widget',
    name: 'Widget',
    componentName: 'Package:Widget',
    properties: {},
    slots: {},
    visibility: Visibility.Visible,
    isEnabled: true,
    opacity: 1,
    size: {},
    zIndex: 0,
    minimumSize: {},
    maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: HorizontalAlignment.Stretch,
    verticalAlignment: VerticalAlignment.Stretch,
};
const document: SceneDocument = { layouts: [], screenTemplates: [], dialogTemplates: [], screens: [{ name: 'StudioScreen', layout: 'Shell', slotContent: { content: [component] }, forms: [], contributions: [] }], exposures: [], instanceContributions: [] };
const Designer = ({ context }: DesignTimeComponentProps) => React.createElement('output', null, `${context.element.id}:${context.profile.name}:${context.bundles.length}`);
const OtherDesigner = () => React.createElement('output', null, 'other designer');
const KindDesigner = () => React.createElement('output', null, 'kind designer');
const bundleWith = (designers: Record<string, typeof Designer>): ScenePackageBundle => ({
    manifest: {
        name: 'Package', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: ['Widget', 'Other'], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
        designTime: { contractVersion: DesignTimeContractVersion, designers: Object.keys(designers), previews: [], propertyEditors: [], propertyDisplays: [], actions: [] },
    },
    components: { [componentRegistryKey('Package', 'Widget')]: () => null, [componentRegistryKey('Package', 'Other')]: () => null },
    descriptors: [descriptor],
    designTime: { designers },
});
const profile = { name: 'Profile', targetPlatform: 'web', packages: ['Package'] };
const environmentWith = (bundle: ScenePackageBundle) => ({
    runtime: { bundles: [bundle], profile, designTime: createDesignTimeHost([bundle], profile), packageDescriptorOf: (candidate: ComponentDescriptor) => candidate },
}) as unknown as ScreenEditorEnvironment;
const bundle = bundleWith({ widgetDesigner: Designer, otherDesigner: OtherDesigner, formEditor: KindDesigner });
const controller = {
    document,
    composition: { element: component, roots: [component], templates: [] },
    applyAll: () => ({ applied: true, diagnostics: [] }),
} as unknown as ScreenEditorController;
const environment = environmentWith(bundle);

describe('when a package designer is registered', () => {
    const html = renderToStaticMarkup(React.createElement(DesignTimeDesignersSection, { component, descriptor, controller, environment, strings: defaultScreenEditorStrings }));

    it('should mount the designer from the package contribution', () => html.should.contain('widget:Profile:1'));
    it('should label the package designer section', () => html.should.contain(defaultScreenEditorStrings.properties.designTimeDesigners));
    it('should not mount a designer registered for another component of the package', () => html.should.not.contain('other designer'));
});

describe('when a package designer is registered for the editor kind the descriptor names', () => {
    const html = renderToStaticMarkup(React.createElement(DesignTimeDesignersSection, { component, descriptor: { ...descriptor, editorKind: 'formEditor' }, controller, environment, strings: defaultScreenEditorStrings }));

    it('should mount it', () => html.should.contain('kind designer'));
});

describe('when the descriptor names a designer its package does not provide', () => {
    const html = renderToStaticMarkup(React.createElement(DesignTimeDesignersSection, { component, descriptor: { ...descriptor, editorKind: 'missingDesigner' }, controller, environment, strings: defaultScreenEditorStrings }));

    it('should say why there is no designer', () => html.should.contain('does not provide'));
});
