// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit, type DialogTemplate } from '@cratis/scene.model';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { ShellSubject, createShellPreference, shellCanFrame, shellShownByDefault, shellSubjectOf, templateCanFrame, templateShownByDefault } from '../shellVisibility';

const quickCreate: DialogTemplate = { name: 'QuickCreateDialog', slots: [] };
const dialogScreen = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'), 'QuickCreateDialog');
const pageScreen = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'));
const fitsPage = { ...pageScreen, screens: pageScreen.screens.map(screen => ({ ...screen, fits: [ScreenFit.Page] })) };
const fitsDrawer = { ...pageScreen, screens: pageScreen.screens.map(screen => ({ ...screen, fits: [ScreenFit.Drawer] })) };

describe('when the screen is a dialog', () => {
    const subject = shellSubjectOf(dialogScreen, undefined, 'AppShell', [quickCreate], [], true);

    it('should be a dialog screen when it names a dialog template', () => subject.should.equal(ShellSubject.DialogScreen));
    it('should be a dialog screen when it fits a drawer', () => shellSubjectOf(fitsDrawer, undefined, 'AppShell').should.equal(ShellSubject.DialogScreen));
    it('should be a dialog screen when it lists no fits, which is what the editor displays as a dialog', () => shellSubjectOf(pageScreen, undefined, 'AppShell', [quickCreate], [], true).should.equal(ShellSubject.DialogScreen));
    it('should be a screen when it lists no fits and its slice is not a State Change slice, or not known', () => shellSubjectOf(pageScreen, undefined, 'AppShell', [quickCreate]).should.equal(ShellSubject.Screen));
    it('should be a dialog screen when it names a dialog template nobody knows', () => shellSubjectOf(dialogScreen, undefined, 'AppShell', [], [], true).should.equal(ShellSubject.DialogScreen));
    it('should stay a screen when it fits a page', () => shellSubjectOf(fitsPage, undefined, 'AppShell').should.equal(ShellSubject.Screen));
    it('should stay a screen when it lists no fits and names a screen template', () => shellSubjectOf(createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'), 'ListScreen'), undefined, 'AppShell', [quickCreate], ['ListScreen'], true).should.equal(ShellSubject.Screen));
    it('should not offer the application shell', () => shellCanFrame(subject).should.be.false);
    it('should not draw the application shell by default', () => shellShownByDefault(subject).should.be.false);
    it('should still offer the template around the content', () => templateCanFrame(subject).should.be.true);
    it('should draw only the content by default', () => templateShownByDefault(subject).should.be.false);
    it('should be the template being authored when one is, whatever the screen is', () => shellSubjectOf(dialogScreen, 'Master/detail', 'AppShell', [quickCreate]).should.equal(ShellSubject.ScreenTemplate));
});

describe('when the author chose to show the shell for pages', () => {
    const preference = createShellPreference({ getItem: () => null, setItem: () => undefined });
    const stored = new Map<string, string>();
    const remembering = createShellPreference({ getItem: key => stored.get(key) ?? null, setItem: (key, value) => { stored.set(key, value); } });
    remembering.write(ShellSubject.Screen, true);

    it('should not remember it for a dialog screen, which is kept apart', () => (remembering.read(ShellSubject.DialogScreen) === undefined).should.be.true);
    it('should remember it for the screens that are pages', () => remembering.read(ShellSubject.Screen)!.should.be.true);
    it('should say nothing for a dialog screen from a storage that holds nothing', () => (preference.read(ShellSubject.DialogScreen) === undefined).should.be.true);
});
