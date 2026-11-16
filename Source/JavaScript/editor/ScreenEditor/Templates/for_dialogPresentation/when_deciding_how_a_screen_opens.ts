// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit, type DialogTemplate, type SceneDocument } from '@cratis/scene.model';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { displayedFitsOf } from '../displayedFits';
import { DialogPresentation, dialogFrameOf, screenPresentationOf } from '../dialogPresentation';

const quickCreate: DialogTemplate = { name: 'QuickCreateDialog', displayName: 'Quick create', slots: [{ name: 'header' }, { name: 'body' }, { name: 'actions' }] };
const known = [quickCreate];

const screen = (template?: string, fits?: ScreenFit[]): SceneDocument => {
    const document = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'), template);
    return fits ? { ...document, screens: document.screens.map(candidate => ({ ...candidate, fits })) } : document;
};

describe('when deciding how a screen opens', () => {
    it('should open as a dialog when its first fit is a dialog', () => dialogFrameOf(screen(undefined, [ScreenFit.Dialog, ScreenFit.Page]))!.presentation.should.equal(DialogPresentation.Dialog));
    it('should open as a drawer when its first fit is a drawer', () => dialogFrameOf(screen(undefined, [ScreenFit.Drawer]))!.presentation.should.equal(DialogPresentation.Drawer));
    it('should be a page when its first fit is a page, though it also fits a dialog', () => (dialogFrameOf(screen(undefined, [ScreenFit.Page, ScreenFit.Dialog])) === undefined).should.be.true);
    it('should be a page when its first fit is a pane', () => (dialogFrameOf(screen(undefined, [ScreenFit.Pane])) === undefined).should.be.true);
    it('should open as a dialog when it says nothing about what it fits, which is what the editor displays and what a lone Dialog is stored as', () => dialogFrameOf(screen(), [], [], true)!.presentation.should.equal(DialogPresentation.Dialog));
    it('should be a page when it says nothing and names a screen template of a blueprint', () => (dialogFrameOf(screen('ListScreen'), known, ['ListScreen']) === undefined).should.be.true);
    it('should be a page when it says nothing and names a screen template of the document', () => (dialogFrameOf({ ...screen('Own'), screenTemplates: [{ name: 'Own', slots: [] }] }) === undefined).should.be.true);
    it('should open as a dialog when it names a blueprint dialog template, stored as that name alone with nothing declared in the document', () => dialogFrameOf(screen('QuickCreateDialog'), known, ['ListScreen'], true)!.presentation.should.equal(DialogPresentation.Dialog));
    it('should draw what the editor displays: the displayed first fit is the presentation', () => (displayedFitsOf(screen('QuickCreateDialog').screens[0], ['ListScreen'], true)[0] === ScreenFit.Dialog).should.be.true);
    it('should display a page for a screen of a blueprint screen template that lists nothing', () => (displayedFitsOf(screen('ListScreen').screens[0], ['ListScreen'])[0] === ScreenFit.Page).should.be.true);
    it('should open as a dialog when it says nothing and names a dialog template of a blueprint', () => dialogFrameOf(screen('QuickCreateDialog'), known, [], true)!.presentation.should.equal(DialogPresentation.Dialog));
    it('should open as a dialog when it names a dialog template the document declares', () => dialogFrameOf({ ...screen('Own'), dialogTemplates: [{ name: 'Own', slots: [] }] }, [], [], true)!.presentation.should.equal(DialogPresentation.Dialog));
    it('should be a page when a screen template of the document stands for the name', () => (dialogFrameOf({ ...screen('QuickCreateDialog'), screenTemplates: [{ name: 'QuickCreateDialog', slots: [] }] }, known) === undefined).should.be.true);
    it('should be a page when its first fit says so, though it names a dialog template', () => (dialogFrameOf(screen('QuickCreateDialog', [ScreenFit.Page]), known) === undefined).should.be.true);
    it('should head the dialog with the template\'s display name', () => dialogFrameOf(screen('QuickCreateDialog'), known, [], true)!.title!.should.equal('Quick create'));
    it('should have no heading of its own when it names no template', () => (dialogFrameOf(screen(undefined, [ScreenFit.Dialog]))!.title === undefined).should.be.true);
    it('should read a screen of a scene the same way', () => (screenPresentationOf({ screenTemplate: 'QuickCreateDialog' }, ['ListScreen'], true) === DialogPresentation.Dialog).should.be.true);
    it('should be a page for a screen of a scene that names a screen template', () => (screenPresentationOf({ screenTemplate: 'ListScreen' }, ['ListScreen']) === undefined).should.be.true);

    // The shape the Screenplay import saves for `screen NewProduct` / `template blueprint Cratis.Blueprint.Default QuickCreateDialog`: the template is named, the
    // document declares neither a dialog template nor a screen template, and nothing says what the screen fits (see SaveSliceUiActorScreen's specifications).
    const stored = JSON.parse('{"layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[],"screens":[{"name":"Screen","layout":"StudioScreen","screenTemplate":"QuickCreateDialog","slotContent":{"content":[]},"forms":[],"contributions":[]}],"exposures":[],"instanceContributions":[]}') as SceneDocument;
    it('should open the stored blueprint dialog screen as a dialog headed by the blueprint\'s template', () => {
        const frame = dialogFrameOf(stored, [quickCreate], ['ListScreen'], true)!;
        frame.presentation.should.equal(DialogPresentation.Dialog);
        frame.title!.should.equal('Quick create');
    });
    it('should open the stored blueprint dialog screen as a dialog even when no blueprint is known', () => dialogFrameOf(stored, [], [], true)!.presentation.should.equal(DialogPresentation.Dialog));
    it('should keep the stored blueprint list screen a page', () => (dialogFrameOf({ ...stored, screens: [{ ...stored.screens[0], screenTemplate: 'ListScreen' }] }, [quickCreate], ['ListScreen']) === undefined).should.be.true);
    // A screen that states no fit fits a dialog only when its slice is opened over a page (a State Change slice's); everywhere else it fits a page.
    it('should be a page for a State View screen that says nothing and names no dialog template', () => {
        (dialogFrameOf(screen(), [], [], false) === undefined).should.be.true;
        (screenPresentationOf({ screenTemplate: undefined }) === undefined).should.be.true;
    });
    it('should open a State View screen that names a blueprint dialog template as a dialog, whatever its slice is', () => dialogFrameOf(screen('QuickCreateDialog'), known, [], false)!.presentation.should.equal(DialogPresentation.Dialog));
    it('should open a State View screen that names a dialog template of the Default blueprint as a dialog when no blueprint is known', () => {
        dialogFrameOf(screen('QuickCreateDialog'))!.presentation.should.equal(DialogPresentation.Dialog);
        dialogFrameOf(screen('FormDialog'))!.presentation.should.equal(DialogPresentation.Dialog);
    });
    it('should display a dialog for a screen that names a dialog template without a slice', () => (displayedFitsOf(screen('QuickCreateDialog').screens[0], [], false, ['QuickCreateDialog'])[0] === ScreenFit.Dialog).should.be.true);
    it('should display a page for a State Change screen that names a screen template', () => (displayedFitsOf(screen('ListScreen').screens[0], ['ListScreen'], true)[0] === ScreenFit.Page).should.be.true);
    it('should let what a screen states win over a dialog template it names', () => (displayedFitsOf(screen('QuickCreateDialog', [ScreenFit.Page]).screens[0], [], false, ['QuickCreateDialog'])[0] === ScreenFit.Page).should.be.true);
    it('should display a page for a screen that says nothing when its slice is not known', () => (displayedFitsOf(screen().screens[0])[0] === ScreenFit.Page).should.be.true);
    it('should display a dialog for a State Change screen that says nothing and builds on no screen template', () => (displayedFitsOf(screen().screens[0], [], true)[0] === ScreenFit.Dialog).should.be.true);
    it('should let what a State View screen states win', () => dialogFrameOf(screen(undefined, [ScreenFit.Dialog]), [], [], false)!.presentation.should.equal(DialogPresentation.Dialog));
    it('should let what a State Change screen states win', () => (dialogFrameOf(screen(undefined, [ScreenFit.Page]), [], [], true) === undefined).should.be.true);
});
