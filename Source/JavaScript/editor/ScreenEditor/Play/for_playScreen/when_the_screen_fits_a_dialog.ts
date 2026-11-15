// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScreenFit, type DialogTemplate, type SceneDocument } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.react';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { contentSlot, createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { composePlayScreen } from '../composePlayScreen';
import { dialogActionsChromeId } from '../../Templates/dialogActionsChrome';
import { PlayScreenView } from '../PlayScreen';

const runtime = createScreenEditorRuntime([corePackage], { name: 'p', targetPlatform: 'web', packages: ['core'] } as never);
const quickCreate: DialogTemplate = { name: 'QuickCreateDialog', displayName: 'Quick create', slots: [{ name: 'body' }] };
const page = createExternalComponent('nav', 'Nav', 'navigationBar', { items: [{ id: 'home', label: 'Home' }] });

// A screen built from a page template (the application's page around it), which fits what is given.
const screenFitting = (fits?: ScreenFit[], template?: string): SceneDocument => {
    const base = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [createExternalComponent('b', 'B', 'button', { label: 'Save' })]), template ?? 'Page');
    return {
        ...base,
        screens: base.screens.map(screen => ({ ...screen, ...(fits ? { fits } : {}) })),
        screenTemplates: template === undefined ? [{ name: 'Page', slots: [{ name: contentSlot }], content: { [contentSlot]: [page] } }] : [],
    };
};

const html = (document: SceneDocument) => renderToStaticMarkup(createElement(PlayScreenView, { document, runtime, resolveBinding: () => undefined }));

describe('when the screen fits a dialog', () => {
    const document = screenFitting([ScreenFit.Dialog]);
    const composed = composePlayScreen(document, runtime.catalog);
    const markup = html(document);

    it('should say it is a dialog', () => composed.dialog!.presentation.should.equal('dialog'));
    it('should draw the screen\'s own content', () => markup.includes('Save').should.be.true);
    it('should draw nothing of the page template around it', () => markup.includes('data-scene-id="nav"').should.be.false);
    it('should draw it as the popup, on a backdrop', () => markup.includes('data-studio-dialog="dialog"').should.be.true);
});

describe('when the screen fits a drawer', () => {
    const markup = html(screenFitting([ScreenFit.Drawer]));

    it('should draw it as a drawer', () => markup.includes('data-studio-dialog="drawer"').should.be.true);
    it('should draw nothing of the page template around it', () => markup.includes('data-scene-id="nav"').should.be.false);
});

describe('when the screen names a dialog template', () => {
    const document = screenFitting(undefined, 'QuickCreateDialog');

    it('should be a dialog when the template is one of the blueprints\'', () => composePlayScreen(document, runtime.catalog, [quickCreate], [], true).dialog!.title!.should.equal('Quick create'));
    it('should still be a dialog when nothing knows the template, with no heading of its own', () => (composePlayScreen(document, runtime.catalog, [], [], true).dialog!.title === undefined).should.be.true);
    it('should be a page when the screen names a screen template of a blueprint', () => (composePlayScreen(screenFitting(undefined, 'ListScreen'), runtime.catalog, [], ['ListScreen'], true).dialog === undefined).should.be.true);
});

describe('when a State View screen names a dialog template and states no fit', () => {
    it('should be a dialog, since the template it names decides, whatever its slice is', () => composePlayScreen(screenFitting(undefined, 'QuickCreateDialog'), runtime.catalog, [quickCreate]).dialog!.title!.should.equal('Quick create'));
});

describe('when the screen is a page', () => {
    const markup = html(screenFitting([ScreenFit.Page]));

    it('should still draw what the page template contributes', () => markup.includes('data-scene-id="nav"').should.be.true);
    it('should not draw a popup', () => markup.includes('data-studio-dialog').should.be.false);
});

describe('when a stored screen never said what it fits', () => {
    const markup = html(screenFitting());

    it('should stay a page, with the template around it as before', () => markup.includes('data-scene-id="nav"').should.be.true);
    it('should not draw a popup', () => markup.includes('data-studio-dialog').should.be.false);
});

describe('when a dialog is drawn as it is played', () => {
    const document = screenFitting([ScreenFit.Dialog]);
    const composed = composePlayScreen(document, runtime.catalog);
    const markup = html(document);
    const names = (composed.element as unknown as { children: { id: string }[] }).children.map(child => child.id);

    it('should draw the dialog\'s button row after its content, as the editor draws it', () => names[names.length - 1].should.equal(dialogActionsChromeId));
    it('should resolve the button row through the dialog template\'s outlet', () => composed.outlets!.chain.length.should.be.greaterThan(0));
    it('should draw the button row\'s actions', () => markup.includes('data-scene-outlet-unresolved').should.be.false);
});

describe('when a page is drawn as it is played', () => {
    const composed = composePlayScreen(screenFitting(), runtime.catalog);
    const ids = (composed.element as unknown as { children: { id: string }[] }).children.map(child => child.id);

    it('should draw no dialog button row', () => ids.includes(dialogActionsChromeId).should.be.false);
});
