// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DiagnosticCode, SceneEditKind, type SceneDocument, type UiProfile } from '@cratis/scene.model';
import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import { corePackage } from '@cratis/scene.react';
import { anIconLibrary } from '../../Icons/given/anIconLibrary';
import { createExternalComponent } from '../Document/createExternalComponent';
import { createPanel } from '../Document/createPanel';
import { contentSlot, createScreenDocument, editingScope } from '../Document/studioScreen';
import { defaultCollectionOperations, exposePropertyEdit } from '../Exposure/exposureEdits';
import { LayoutItem } from '../Layouts/LayoutItem';
import { PlayScreenView } from '../Play/PlayScreen';
import { createScreenEditorRuntime, type ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { applyToSession, openSession } from '../Session/EditSession';

// Two libraries that both ship `home`. Choosing one must never be able to turn into the other, anywhere between the
// picker and the played screen.
const bundles = [corePackage, anIconLibrary('Acme.Icons', ['home']), anIconLibrary('Other.Icons', ['home'])];
const profileOf = (...packages: string[]): UiProfile => ({ name: 'p', targetPlatform: 'web', packages: ['core', ...packages] }) as UiProfile;

// A screen built on a template whose navigation items are exposed, so the screen may add items of its own - the way a
// navigation item is edited in the inspector.
const screenOnTemplate = (): SceneDocument => {
    const base = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'), 'Shell');
    const nav = createExternalComponent('nav', 'Nav', 'navigationBar', { items: [{ id: 'home', values: { label: 'Home' } }] });
    return { ...base, screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: { [contentSlot]: [nav] } }] };
};

const authoring = (runtime: ScreenEditorRuntime): EditingContext => ({ ...usingScreen(runtime), scope: editingScope('Shell', true) });
const usingScreen = (runtime: ScreenEditorRuntime): EditingContext => ({
    catalog: runtime.catalog, scope: editingScope(), queryCandidates: [], iconCatalog: runtime.icons,
});

const exposed = (runtime: ScreenEditorRuntime) =>
    applyToSession(openSession(screenOnTemplate()), exposePropertyEdit('Shell', 'nav', 'items', { operations: defaultCollectionOperations }), authoring(runtime), 'Expose').document;

const addItem = (id: string, library?: string) => ({
    kind: SceneEditKind.AddCollectionItem, component: 'nav', path: 'items',
    item: { id, values: { label: id, destination: { screen: 'Home' }, ...(library ? { icon: { library, key: 'home' } } : {}) } },
}) as never;

const chooseIcon = (itemId: string, library: string) => ({
    kind: SceneEditKind.EditCollectionItem, component: 'nav', path: 'items', itemId, field: 'icon', value: { library, key: 'home' },
}) as never;

const itemsOf = (document: SceneDocument, runtime: ScreenEditorRuntime) =>
    inspect(document, elementNodeId('nav'), usingScreen(runtime))!.properties.find(property => property.descriptor.path === 'items')!.items!;

const librariesOf = (document: SceneDocument, runtime: ScreenEditorRuntime) =>
    itemsOf(document, runtime).filter(item => item.editable).map(item => (item.values.icon as { library: string } | undefined)?.library);

describe('when two libraries ship an icon of the same name', () => {
    const runtime = createScreenEditorRuntime(bundles, profileOf('Acme.Icons', 'Other.Icons'));
    let saved: string;
    let reopened: SceneDocument;
    let markup: string;
    let codes: string[];

    beforeAll(async () => {
        await runtime.icons.load();
        let session = openSession(exposed(runtime));
        session = applyToSession(session, addItem('first'), usingScreen(runtime), 'Add');
        session = applyToSession(session, addItem('second'), usingScreen(runtime), 'Add');
        session = applyToSession(session, chooseIcon('first', 'Acme.Icons'), usingScreen(runtime), 'Icon');
        session = applyToSession(session, chooseIcon('second', 'Other.Icons'), usingScreen(runtime), 'Icon');
        codes = session.diagnostics.map(diagnostic => diagnostic.code);

        saved = JSON.stringify(session.document);
        reopened = JSON.parse(saved) as SceneDocument;
        markup = renderToStaticMarkup(createElement(PlayScreenView, { document: reopened, runtime, resolveBinding: () => undefined }));
    });

    it('should accept both choices', () => codes.should.not.include(DiagnosticCode.MissingIconLibrary));
    it('should keep each item on its own library once saved and reopened', () => librariesOf(reopened, runtime).should.deep.equal(['Acme.Icons', 'Other.Icons']));
    it('should store the library with the icon', () => saved.should.include('"library":"Other.Icons","key":"home"'));
    it('should play each item with the library it was given', () => {
        markup.should.match(/data-scene-item="first"[^>]*data-scene-icon-library="Acme\.Icons"[^>]*data-scene-icon-key="home"/);
        markup.should.match(/data-scene-item="second"[^>]*data-scene-icon-library="Other\.Icons"[^>]*data-scene-icon-key="home"/);
    });
    it('should have one adapter for each library to draw them with', () => runtime.iconAdapters.libraries.should.have.members(['Acme.Icons', 'Other.Icons']));
});

describe('when the author picks an icon from a library the profile does not have', () => {
    const runtime = createScreenEditorRuntime(bundles, profileOf('Acme.Icons'));
    let before: SceneDocument;
    let outcome: ReturnType<typeof applyToSession>;

    beforeAll(async () => {
        await runtime.icons.load();
        before = applyToSession(openSession(exposed(runtime)), addItem('first', 'Acme.Icons'), usingScreen(runtime), 'Add').document;
        outcome = applyToSession(openSession(before), chooseIcon('first', 'Other.Icons'), usingScreen(runtime), 'Icon');
    });

    it('should refuse the edit and say the library is missing', () => outcome.diagnostics.map(diagnostic => diagnostic.code).should.include(DiagnosticCode.MissingIconLibrary));
    it('should leave the document as it was', () => outcome.document.should.equal(before));
});

describe('when a library is removed from the profile after a screen chose its icon', () => {
    const withBoth = createScreenEditorRuntime(bundles, profileOf('Acme.Icons', 'Other.Icons'));
    const withoutOther = createScreenEditorRuntime(bundles, profileOf('Acme.Icons'));
    let stored: SceneDocument;
    let reported: string[];

    beforeAll(async () => {
        await withBoth.icons.load();
        await withoutOther.icons.load();
        stored = applyToSession(openSession(exposed(withBoth)), addItem('second', 'Other.Icons'), usingScreen(withBoth), 'Add').document;
        reported = inspect(stored, elementNodeId('nav'), usingScreen(withoutOther))!.diagnostics.map(diagnostic => diagnostic.code);
    });

    it('should report the icon that no longer resolves', () => reported.should.include(DiagnosticCode.MissingIconLibrary));
    it('should keep the stored icon rather than dropping or replacing it', () => librariesOf(stored, withoutOther).should.deep.equal(['Other.Icons']));
});
