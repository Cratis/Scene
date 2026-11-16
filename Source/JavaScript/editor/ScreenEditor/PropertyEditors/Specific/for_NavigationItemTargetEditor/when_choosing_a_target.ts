// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';
import { anEditorContext } from '../../Registry/for_PropertyEditorRegistry/given/anEditorContext';
import { NavigationItemTargetEditor } from '../NavigationItemTargetEditor';
import { structure } from '../../../DesignMode/Navigation/given/applicationNavigation';

const descriptor: PropertyDescriptor = { path: 'target', label: 'Navigate to', group: 'Content', valueType: PropertyValueType.String, editorKind: 'navigationItemTarget' };
const draw = (value: unknown, navigationModule?: string) => renderToStaticMarkup(createElement(NavigationItemTargetEditor, {
    value, onChange: () => undefined, descriptor, id: 'x', context: anEditorContext({ structure, ...(navigationModule ? { navigationModule } : {}) } as never),
}));
const rowsOf = (markup: string) => markup.split('<button').slice(1);

describe('when choosing a target at the application level', () => {
    const markup = draw({ module: 'sales' });
    it('should let every module and feature be chosen', () => rowsOf(markup).every(row => !row.includes('aria-disabled="true"')).should.be.true);
    it('should highlight the current target', () => markup.should.match(/data-chosen="true"[^>]*>(<span>)?Sales/));
});

describe('when choosing a target for an item of a module', () => {
    const rows = rowsOf(draw({ module: 'sales', feature: 'orders' }, 'sales'));
    const rowFor = (label: string) => rows.find(row => row.includes(`<span>${label}</span>`))!;
    it('should let its own module and features be chosen (a module\'s own items may only target that module)', () => { rowFor('Sales').should.not.contain('aria-disabled'); rowFor('Orders').should.not.contain('aria-disabled'); });
    it('should list another module and its features, but not let them be chosen', () => { rowFor('Support').should.contain('aria-disabled="true"'); rowFor('Tickets').should.contain('aria-disabled="true"'); });
    it('should say why', () => rowFor('Support').should.contain("can only link to that module"));
    it('should still let the item be unlinked', () => rows.find(row => row.includes('>Not linked<'))!.should.not.contain('aria-disabled'));
});
