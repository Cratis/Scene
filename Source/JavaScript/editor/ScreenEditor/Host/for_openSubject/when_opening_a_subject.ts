// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.react';
import { composeEditorScreen } from '../../Templates/composeEditorScreen';
import { isCanvas, isStackPanel } from '@cratis/scene.engine';
import { authoredRoot, createScreenDocument, createTemplateDocument, screenRootId, templateRootId } from '../../Document/studioScreen';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { openSubject as open } from '../openSubject';
import { SceneDocumentProblem } from '../../Document/readSceneDocument';

const openSubject = (subject: Parameters<typeof open>[0], runtime?: Parameters<typeof open>[1], selectable?: Parameters<typeof open>[2]) => {
    const result = open(subject, runtime, selectable);
    if (!result.opened) throw new Error(`expected the subject to open, but it was ${result.problem}`);
    return result.subject;
};
const problemOf = (subject: Parameters<typeof open>[0]) => {
    const result = open(subject);
    return result.opened ? undefined : result.problem;
};

const saved = () => createScreenDocument(createPanel(LayoutItem.Stack, 'saved', 'Saved', [createExternalComponent('b', 'Save', 'button')]));

describe('when opening a screen that has a saved document', () => {
    const document = saved();
    const opened = openSubject({ document });

    it('should use the document as it is', () => (opened.document === document).should.be.true);
    it('should not add anything to the result but the document', () => Object.keys(opened).should.deep.equal(['document']));
});

describe('when a saved document is stored as text', () => {
    const opened = openSubject({ documentText: JSON.stringify(saved()) });

    it('should open the document', () => authoredRoot(opened.document)!.id.should.equal('saved'));
    it('should keep what the document holds', () => authoredRoot(opened.document)!.children.length.should.equal(1));
});

describe('when opening a screen that has nothing saved', () => {
    const root = authoredRoot(openSubject({}).document)!;

    it('should open an empty screen', () => root.children.should.deep.equal([]));
    it('should author it in the flow layout every screen draws in, not in free positions', () => (isStackPanel(root) && !isCanvas(root)).should.be.true);
    it('should give the root the screen root id', () => root.id.should.equal(screenRootId));
    it('should hold exactly one screen', () => openSubject({}).document.screens.length.should.equal(1));
    it('should not hold a template', () => openSubject({}).document.screenTemplates.should.deep.equal([]));
});

describe('when opening a new screen with a size and a template', () => {
    const opened = openSubject({ windowSize: { width: 640, height: 480 }, screenTemplate: 'Shell' });

    it('should not fix the root to that size, since the screen takes the size of the window it is shown in', () => (isCanvas(authoredRoot(opened.document)!)).should.be.false);
    it('should select the template', () => opened.document.screens[0].screenTemplate!.should.equal('Shell'));
});

describe('when opening a template that has nothing saved', () => {
    const opened = openSubject({ authoringTemplate: 'Shell' });

    it('should author the template', () => opened.document.screenTemplates[0].name.should.equal('Shell'));
    it('should open it empty', () => authoredRoot(opened.document, 'Shell')!.children.should.deep.equal([]));
    it('should not hold a screen', () => opened.document.screens.should.deep.equal([]));
    it('should not reuse the id a screen root has, which a composed screen would then hold twice', () => authoredRoot(opened.document, 'Shell')!.id.should.equal(templateRootId));
});

describe('when opening twice', () => {
    it('should give the same new screen every time', () => JSON.stringify(openSubject({}).document).should.equal(JSON.stringify(openSubject({}).document)));
});

describe('when a saved document cannot be read', () => {
    it('should not open when it is not JSON', () => problemOf({ documentText: '{not json' })!.should.equal(SceneDocumentProblem.NotJson));
    it('should not open when it is an empty object, rather than failing later', () => problemOf({ documentText: '{}' })!.should.equal(SceneDocumentProblem.WrongShape));
    it('should not open when a collection is not a list', () => problemOf({ documentText: JSON.stringify({ ...saved(), screens: {} }) })!.should.equal(SceneDocumentProblem.WrongShape));
    it('should not replace it with an empty screen', () => (problemOf({ documentText: '{}' }) === undefined).should.be.false);
});

describe('when the saved document does not hold what was asked to be opened', () => {
    const screenOnly = JSON.stringify(saved());
    const templateOnly = JSON.stringify(createTemplateDocument('Shell', createPanel(LayoutItem.Stack, 'r', 'R')));

    it('should refuse a template that is not in it, rather than open an empty editor', () => problemOf({ documentText: screenOnly, authoringTemplate: 'Shell' })!.should.equal(SceneDocumentProblem.MissingTemplate));
    it('should refuse a template saved under another name', () => problemOf({ documentText: templateOnly, authoringTemplate: 'Renamed' })!.should.equal(SceneDocumentProblem.MissingTemplate));
    it('should open the template that is in it', () => (problemOf({ documentText: templateOnly, authoringTemplate: 'Shell' }) === undefined).should.be.true);
    it('should refuse a screen that is not in it', () => problemOf({ documentText: templateOnly })!.should.equal(SceneDocumentProblem.MissingScreen));
});

describe('when opening a saved screen that is on another template than the selected one', () => {
    const document = createScreenDocument(createPanel(LayoutItem.Stack, 'saved', 'Saved'), 'Earlier');
    const opened = openSubject({ document: { ...document, screenTemplates: [{ name: 'Selected', slots: [] }] }, screenTemplate: 'Selected' });
    const screen = opened.document.screens.find(candidate => candidate.name === 'Screen');

    it('should open it on the selected template', () => screen!.screenTemplate!.should.equal('Selected'));
    it('should keep what the screen holds', () => authoredRoot(opened.document)!.id.should.equal('saved'));
    it('should leave the saved document untouched', () => document.screens[0].screenTemplate!.should.equal('Earlier'));
});

describe('when opening a saved screen that already uses the selected template', () => {
    const document = createScreenDocument(createPanel(LayoutItem.Stack, 'saved', 'Saved'), 'Selected');

    it('should use the document as it is', () => (openSubject({ document, screenTemplate: 'Selected' }).document === document).should.be.true);
});

const template = (name: string, fitsSlot: string, slot: string): ScreenTemplate => ({
    name, fitsSlot, slots: [{ name: slot }], content: { [slot]: [createPanel(LayoutItem.Stack, name, name)] },
});
const oldTemplates = [template('OldParent', 'StudioScreen.content', 'old'), template('Old', 'OldParent.old', 'content')];
const newTemplates = [template('NewParent', 'StudioScreen.content', 'new'), template('New', 'NewParent.new', 'content')];
const runtimeWith = (templates: ScreenTemplate[]): Parameters<typeof open>[1] => ({
    profile: { name: 'test', targetPlatform: 'web', packages: [] }, packages: {},
    bundles: [{ ...corePackage, screenTemplates: templates }],
});
const storedOnOld = () => ({ ...createScreenDocument(createPanel(LayoutItem.Stack, 'saved', 'Saved'), 'Old'), screenTemplates: oldTemplates });

describe('when rebasing a saved screen onto a different template chain', () => {
    const document = storedOnOld();
    const opened = openSubject({ document, screenTemplate: 'New' }, runtimeWith(newTemplates)).document;

    it('should reference the selected template', () => opened.screens[0].screenTemplate!.should.equal('New'));
    it('should carry the selected template and its parent', () => opened.screenTemplates.should.deep.equal([...oldTemplates, ...newTemplates]));
    it('should resolve the selected ancestry in the editor', () => composeEditorScreen(opened).templates.should.deep.equal(['NewParent', 'New']));
    it('should preserve the screen content', () => authoredRoot(opened)!.id.should.equal('saved'));
    it('should leave the saved definitions untouched', () => document.screenTemplates.should.deep.equal(oldTemplates));
    it('should not share the packaged definitions', () => (opened.screenTemplates.find(candidate => candidate.name === 'New') === newTemplates[1]).should.be.false);
});

describe('when the selected template definition is unavailable', () => {
    const document = storedOnOld();
    const opened = openSubject({ document, screenTemplate: 'New' }).document;

    it('should keep the stored template', () => opened.screens[0].screenTemplate!.should.equal('Old'));
    it('should keep the stored definitions', () => opened.screenTemplates.should.deep.equal(oldTemplates));
});

describe('when the selected template parent is unavailable', () => {
    const document = storedOnOld();
    const opened = openSubject({ document, screenTemplate: 'New' }, runtimeWith([newTemplates[1]])).document;

    it('should keep the stored template rather than an incomplete chain', () => opened.screens[0].screenTemplate!.should.equal('Old'));
    it('should not add incomplete definitions', () => opened.screenTemplates.should.deep.equal(oldTemplates));
});

describe('when opening a seeded screen on an application template stored by identifier', () => {
    const seeded = createScreenDocument(createPanel(LayoutItem.Stack, 'seeded', 'Seeded'));
    const own: ScreenTemplate = { name: '0f8fad5b-d9cb-469f-a165-70867728950e', slots: [{ name: 'content' }] };
    const opened = openSubject({ document: seeded, screenTemplate: own.name }, runtimeWith([]), [own]).document;

    it('should build the screen on the selected template', () => opened.screens[0].screenTemplate!.should.equal(own.name));
    it('should carry the template definition with the screen', () => opened.screenTemplates.map(candidate => candidate.name).should.deep.equal([own.name]));
});

describe('when opening a screen whose slice opens over a page', () => {
    it('should carry that to what is opened', () => (openSubject({ document: saved(), opensOverPage: true }).opensOverPage === true).should.be.true);
    it('should carry nothing when the slice does not', () => (openSubject({ document: saved() }).opensOverPage === undefined).should.be.true);
});
