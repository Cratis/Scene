// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it } from 'vitest';
import { HorizontalAlignment, PackageKind, VerticalAlignment, Visibility, type ComponentDescriptor, type ExternalComponent, type SceneDocument } from '@cratis/scene.model';
import { componentRegistryKey, DesignTimeContractVersion, type DesignTimeComponentProps, type ScenePackageBundle } from '@cratis/scene.react';
import { createDesignTimeHost } from '../../Runtime/createDesignTimeHost';
import { DesignTimeActionsSection } from '../DesignTimeActionsSection';
import { DesignTimeDesignersSection } from '../DesignTimeDesignersSection';
import { UnapprovedPackageNotice } from '../UnapprovedPackageNotice';
import { defaultScreenEditorStrings } from '../../Defaults/defaultScreenEditorStrings';
import type { ScreenEditorController } from '../../Host/ScreenEditorController';
import type { ScreenEditorEnvironment } from '../../Host/ScreenEditorHost';

const descriptor: ComponentDescriptor = { component: componentRegistryKey('Cratis.Components', 'Widget'), displayName: 'Widget', editorKind: 'widgetDesigner', properties: [], actions: [{ id: 'generate', label: 'Generate', description: 'Generates' }] };
const component: ExternalComponent = {
    id: 'widget',
    name: 'Widget',
    componentName: 'Cratis.Components:Widget',
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
const bundleWith = (designers: Record<string, typeof Designer>): ScenePackageBundle => ({
    manifest: {
        name: 'Cratis.Components', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: ['Widget', 'Other'], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
        designTime: { contractVersion: DesignTimeContractVersion, designers: Object.keys(designers), previews: [], propertyEditors: [], propertyDisplays: [], actions: ['generate'] },
    },
    components: { [componentRegistryKey('Cratis.Components', 'Widget')]: () => null, [componentRegistryKey('Cratis.Components', 'Other')]: () => null },
    descriptors: [descriptor],
    designTime: { designers, actions: { generate: { descriptor: { id: 'generate', label: 'Generate', description: 'Generates' }, isVisible: () => true, isEnabled: () => true, execute: () => ({ edits: [], diagnostics: [] }) } } },
});
const bundle = bundleWith({ widgetDesigner: Designer });
const withProfile = (packages: string[]) => {
    const profile = { name: 'Profile', targetPlatform: 'web', packages };
    return { runtime: { bundles: [bundle], profile, designTime: createDesignTimeHost([bundle], profile), packageDescriptorOf: (candidate: ComponentDescriptor) => candidate } } as unknown as ScreenEditorEnvironment;
};
const controller = { document, composition: { element: component, roots: [component], templates: [] }, applyAll: () => ({ applied: true, diagnostics: [] }) } as unknown as ScreenEditorController;
const strings = defaultScreenEditorStrings;
const occurrences = (html: string, text: string) => html.split(text).length - 1;
const render = (environment: ScreenEditorEnvironment, selected: ComponentDescriptor = descriptor) => renderToStaticMarkup(React.createElement(React.Fragment, null,
    React.createElement(UnapprovedPackageNotice, { descriptor: selected, component, controller, environment, strings }),
    React.createElement(DesignTimeDesignersSection, { component, descriptor: selected, controller, environment, strings }),
    React.createElement(DesignTimeActionsSection, { component, descriptor: selected, controller, environment, strings, disabled: false })));

describe('when the package of the selected component is not in the UI profile', () => {
    const html = render(withProfile([]));

    it('should say so once, naming the package', () => occurrences(html, 'The package Cratis.Components is not in this application').should.equal(1));
    it('should say what to do about it', () => html.should.contain('Add Cratis.Components to the packages of the UI profile.'));
    it('should not repeat the host reason for the designer or the action', () => html.should.not.contain('not approved by this host'));
    it('should not offer the designer', () => html.should.not.contain('studio-editor-properties__designers'));
    it('should show the action disabled', () => html.should.match(/<button[^>]*disabled=""[^>]*>Generate<\/button>/));
});

describe('when the package of the selected component is in the UI profile', () => {
    const html = render(withProfile(['Cratis.Components']));

    it('should not say anything about the package', () => html.should.not.contain('is not in this application'));
    it('should offer the designer', () => html.should.contain('widget:Profile:1'));
});

// Neither a built-in nor a package without design-time contributions asks Scene for an extension to refuse.
describe.each(['core:text', 'RuntimeOnly:Widget'])('when selecting %s without design-time contributions', componentName => {
    const plain: ComponentDescriptor = { component: componentName, displayName: 'Widget', properties: [] };
    const html = render(withProfile([]), plain);

    it('should not claim the package is absent from the profile', () => html.should.not.contain('is not in this application'));
    it('should show no package alert', () => html.should.not.contain('role="alert"'));
});

describe('when the selected descriptor uses the alias of an approved package component', () => {
    const environment = withProfile(['Cratis.Components']);
    environment.runtime.packageDescriptorOf = () => descriptor;
    const html = render(environment, { ...descriptor, component: 'Widget' });

    it('should not claim the alias is an unapproved package', () => html.should.not.contain('is not in this application'));
    it('should offer the package designer', () => html.should.contain('widget:Profile:1'));
});

describe('when only an action asks for an unapproved package contribution', () => {
    const html = render(withProfile([]), { ...descriptor, editorKind: undefined });

    it('should say which package was refused once', () => occurrences(html, 'The package Cratis.Components is not in this application').should.equal(1));
    it('should not repeat the host reason for the action', () => html.should.not.contain('not approved by this host'));
});
