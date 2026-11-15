// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, type SceneDocument } from '@cratis/scene.model';
import { createDescriptorCatalog, elementNodeId, inspect } from '@cratis/scene.engine';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { Ownership } from '../../Structure/Ownership';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { contentSlot, createScreenDocument, screenName, studioLayout } from '../../Document/studioScreen';
import { everyElementId } from '../../Selection/sceneTree';
import { composeEditorScreen } from '../composeEditorScreen';
import { resolveOwnership } from '../templateProvenance';

const header = createExternalComponent('header', 'Header', 'navigationBar');
const body = createExternalComponent('body', 'Body', 'button');

const documentWithTemplate = (): SceneDocument => {
    const base = createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [body]), 'Shell');
    return { ...base, screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: { [contentSlot]: [header] } }] };
};

describe('when composing a screen that uses a template', () => {
    const composition = composeEditorScreen(documentWithTemplate());

    it('should name the template that contributes', () => composition.templates.should.deep.equal(['Shell']));
    it('should put the template\'s content ahead of the screen\'s', () => everyElementId(composition.roots).should.deep.equal(['header', 'screen-root', 'body']));
    it('should know which part is the screen\'s own', () => everyElementId(composition.own).should.deep.equal(['screen-root', 'body']));
});

describe('when composing a screen that fills the slots of a template of a blueprint', () => {
    const document: SceneDocument = { ...createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [])), screens: [{ name: screenName, layout: studioLayout.name, screenTemplate: 'ListScreen', forms: [], contributions: [], slotContent: {
        header: [createExternalComponent('list-title', 'Title', 'pageHeader')],
        list: [createExternalComponent('list-table', 'Table', 'dataList')],
    } }] };

    it('should draw the content of every slot the screen fills', () => everyElementId(composeEditorScreen(document).roots).should.deep.equal(['list-title', 'list-table']));
    it('should hold the content of every slot the screen fills as its own', () => everyElementId(composeEditorScreen(document).own).should.deep.equal(['list-title', 'list-table']));
    it('should draw the editor\'s own content slot first', () => {
        const withContent: SceneDocument = { ...document, screens: [{ ...document.screens[0], slotContent: { ...document.screens[0].slotContent, [contentSlot]: [createExternalComponent('own', 'Own', 'button')] } }] };
        everyElementId(composeEditorScreen(withContent).roots).should.deep.equal(['own', 'list-title', 'list-table']);
    });
});

describe('when composing a screen with no template', () => {
    it('should hold only the screen\'s own content', () => everyElementId(composeEditorScreen(createScreenDocument(createPanel(LayoutItem.Stack, 'r', 'R'))).roots).should.deep.equal(['r']));
});

describe('when asking who owns what in the composition', () => {
    const document = documentWithTemplate();
    const context = { catalog: createDescriptorCatalog([]), scope: { kind: EditingScopeKind.Screen, name: screenName } };
    const ownership = resolveOwnership(document, composeEditorScreen(document).roots, context);

    it('should lock the content a template contributes', () => ownership('header').should.not.equal(Ownership.Local));
    it('should leave the screen\'s own content editable', () => ownership('body').should.equal(Ownership.Local));
    it('should agree with what Scene itself reports', () =>
        inspect(document, elementNodeId('header'), context)!.provenance.kind.should.not.equal('local'));
});

describe('when authoring the template itself', () => {
    const document = documentWithTemplate();
    const context = { catalog: createDescriptorCatalog([]), scope: { kind: EditingScopeKind.ScreenTemplate, name: 'Shell', layout: studioLayout.name } };
    const composition = composeEditorScreen(document, 'Shell');

    it('should compose only the template\'s own content', () => everyElementId(composition.roots).should.deep.equal(['header']));
    it('should let the author edit it', () => resolveOwnership(document, composition.roots, context)('header').should.equal(Ownership.Local));
});

describe('when composing a screen that keeps a table and a toolbar natively', () => {
    const base = createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', []));
    const document = {
        ...base,
        screens: [{
            name: screenName, layout: studioLayout.name, screenTemplate: 'ListScreen', forms: [],
            slotContent: { header: [createExternalComponent('list-title', 'Title', 'pageHeader')] },
            native: { slots: { header: [{ at: 1, text: 'toolbar actions\n  button new title "New"' }], list: [{ at: 0, text: 'table OrderRow\n  column orderId label "Order"\n  on double click\n    navigate to OrderPage' }] } },
        }],
    } as unknown as SceneDocument;

    it('should draw the native content beside the typed one of its slot, and the slots that hold only native content', () =>
        everyElementId(composeEditorScreen(document).roots).should.deep.equal(['list-title', 'native-header-0-0', 'native-list-0-0', 'native-list-0-0-column-0']));
});
