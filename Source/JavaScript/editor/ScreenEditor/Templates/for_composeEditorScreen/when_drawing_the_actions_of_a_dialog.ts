// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit, type SceneDocument } from '@cratis/scene.model';
import { composeEditorScreen } from '../composeEditorScreen';
import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { dialogActionsChromeId, documentWithChrome, screenFitsDialog, showsDialogActions } from '../dialogActionsChrome';
import { orderDialogDocument } from '../../DesignMode/Outlets/given/orderDialog';

const fitting = (fits: ScreenFit[] | undefined): SceneDocument => {
    const document = orderDialogDocument();
    return { ...document, screens: document.screens.map(screen => ({ ...screen, fits })) } as SceneDocument;
};

describe('when composing a screen that fits a dialog for editing', () => {
    const composition = composeEditorScreen(orderDialogDocument(), undefined, { dialogActions: true });
    it('should draw the button row after the screen\'s content', () => composition.roots[composition.roots.length - 1].id.should.equal(dialogActionsChromeId));
    it('should draw it as the outlet of actions called actions', () => {
        const row = composition.chrome[0] as unknown as { componentName: string; properties: { name: string; kind: string } };
        [row.componentName, row.properties.name, row.properties.kind].should.deep.equal(['core:outletItems', 'actions', 'actions']);
    });
    it('should not count it as the screen\'s own', () => composition.own.some(element => element.id === dialogActionsChromeId).should.be.false);
});

describe('when composing the same screen for the preview, Play or a thumbnail', () => {
    const composition = composeEditorScreen(orderDialogDocument());
    it('should draw no chrome', () => composition.chrome.length.should.equal(0));
    it('should not put the button row among the roots', () => composition.roots.some(element => element.id === dialogActionsChromeId).should.be.false);
});

describe('when authoring a template', () => {
    const composition = composeEditorScreen(orderDialogDocument(), 'Anything', { dialogActions: true });
    it('should draw no button row', () => composition.chrome.length.should.equal(0));
});

describe('when asking Scene about the button row, which is not in the document', () => {
    const document = { ...orderDialogDocument(), screens: [{ name: 'Screen', layout: 'StudioScreen', slotContent: { content: [createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [])] }, fits: [ScreenFit.Dialog] }] } as unknown as SceneDocument;
    const composition = composeEditorScreen(document, undefined, { dialogActions: true });
    const inspected = documentWithChrome(document, composition.chrome);
    const rootOf = (candidate: SceneDocument) => (candidate.screens[0].slotContent.content[0] as unknown as { children: { id: string }[] }).children.map(child => child.id);
    it('should place it in the screen\'s root', () => rootOf(inspected).should.deep.equal([dialogActionsChromeId]));
    it('should leave the document the editor holds without it', () => rootOf(document).should.deep.equal([]));
    it('should change nothing when there is no chrome', () => documentWithChrome(document, []).should.equal(document));
});

describe('when deciding whether a screen draws the dialog\'s button row', () => {
    it('should for a State Change screen that does not say what it fits', () => showsDialogActions(fitting(undefined), [], [], true).should.be.true);
    it('should not for a screen that does not say what it fits when its slice does not open over a page', () => showsDialogActions(fitting(undefined)).should.be.false);
    it('should for a dialog', () => showsDialogActions(fitting([ScreenFit.Dialog])).should.be.true);
    it('should for a drawer', () => showsDialogActions(fitting([ScreenFit.Drawer])).should.be.true);
    it('should not for a page', () => screenFitsDialog(fitting([ScreenFit.Page])).should.be.false);
    it('should not when its template declares an outlet called actions', () => {
        const document = fitting([ScreenFit.Dialog]);
        const template = { name: 'Wizard', slots: [], outlets: [{ name: 'actions', kind: 'actions', defaults: [] }] };
        showsDialogActions({ ...document, screens: document.screens.map(screen => ({ ...screen, screenTemplate: 'Wizard' })) } as SceneDocument, [template as never]).should.be.false;
    });
});
