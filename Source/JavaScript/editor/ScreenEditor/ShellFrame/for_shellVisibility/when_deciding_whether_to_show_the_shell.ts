// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit } from '@cratis/scene.model';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { ShellSubject, createShellPreference, shellCanFrame, shellShownByDefault, shellSubjectOf, templateCanFrame, templateShownByDefault } from '../shellVisibility';

const page = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', []));
const document = { ...page, screens: page.screens.map(screen => ({ ...screen, fits: [ScreenFit.Page] })), dialogTemplates: [{ name: 'Confirm', slots: [{ name: 'content' }], behaviors: [] }] };

describe('when asking what is being edited', () => {
    it('should be a screen when no template is authored and the screen fits a page', () => shellSubjectOf(document, undefined, 'AppShell').should.equal(ShellSubject.Screen));
    it('should be a dialog template when the authored template is one', () => shellSubjectOf(document, 'Confirm', 'AppShell').should.equal(ShellSubject.DialogTemplate));
    it('should be the shell when the authored template is the shell', () => shellSubjectOf(document, 'AppShell', 'AppShell').should.equal(ShellSubject.TheShell));
    it('should be a screen template otherwise', () => shellSubjectOf(document, 'Master/detail', 'AppShell').should.equal(ShellSubject.ScreenTemplate));
});

describe('when the author has not chosen', () => {
    it('should not draw the shell around a screen, which is the slice\'s own content', () => shellShownByDefault(ShellSubject.Screen).should.be.false);
    it('should draw the shell around a screen template', () => shellShownByDefault(ShellSubject.ScreenTemplate).should.be.true);
    it('should not draw it around a dialog template', () => shellShownByDefault(ShellSubject.DialogTemplate).should.be.false);
    it('should offer no shell around the shell itself', () => shellCanFrame(ShellSubject.TheShell).should.be.false);
});

describe('when remembering the choice', () => {
    const store = new Map<string, string>();
    const preference = createShellPreference({ getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } });
    preference.write(ShellSubject.Screen, false);

    it('should remember it for screens apart from screen templates', () => (preference.read(ShellSubject.ScreenTemplate) === undefined).should.be.true);
    it('should remember it for the screen', () => preference.read(ShellSubject.Screen)!.should.be.false);
    it('should keep it apart from dialog templates', () => (preference.read(ShellSubject.DialogTemplate) === undefined).should.be.true);
    it('should say nothing for a storage that cannot be read', () => (createShellPreference(undefined).read(ShellSubject.Screen) === undefined).should.be.true);
});

describe('when the author has not chosen to see the template', () => {
    it('should draw only the slice\'s own content for a screen', () => templateShownByDefault(ShellSubject.Screen).should.be.false);
    it('should offer the template around a screen', () => templateCanFrame(ShellSubject.Screen).should.be.true);
    it('should offer none around a template being authored', () => templateCanFrame(ShellSubject.ScreenTemplate).should.be.false);
});

describe('when remembering whether the template is shown', () => {
    const store = new Map<string, string>();
    const preference = createShellPreference({ getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); } });
    preference.writeTemplate(ShellSubject.Screen, true);

    it('should remember it for the screen', () => preference.readTemplate(ShellSubject.Screen)!.should.be.true);
    it('should keep it apart from the shell choice', () => (preference.read(ShellSubject.Screen) === undefined).should.be.true);
});
