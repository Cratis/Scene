// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { authoredRoot, createScreenDocument } from '../studioScreen';
import { createPanel } from '../createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { screenNamesOf, withScreenAsPrimary, withScreenRestored } from '../screenSelection';
import { openSubject } from '../../Host/openSubject';
import { readSceneDocument, SceneDocumentProblem } from '../readSceneDocument';

// A design's screens are named for what they are (Home, Invoices), and none is called Screen: the editor still works on the one called Screen.
const named = (name: string, id: string): SceneDocument['screens'][number] => ({ ...createScreenDocument(createPanel(LayoutItem.Stack, id, id)).screens[0]!, name });
const document = (): SceneDocument => ({ ...createScreenDocument(createPanel(LayoutItem.Stack, 'first', 'First')), screens: [named('Home', 'home'), named('Invoices', 'invoices')] });

describe('when a document holds no screen called Screen', () => {
    const stored = document();

    describe('and a screen of it is read', () => {
        it('should be readable for a screen it holds', () => readSceneDocument(JSON.stringify(stored), undefined, 'Invoices').readable.should.be.true);
        it('should not be readable for a screen it does not hold', () => {
            const read = readSceneDocument(JSON.stringify(stored), undefined, 'Nope');
            (!read.readable && read.problem).should.equal(SceneDocumentProblem.MissingScreen);
        });
        it('should not be readable when no screen is asked for, because none is called Screen', () => {
            const read = readSceneDocument(JSON.stringify(stored));
            (!read.readable && read.problem).should.equal(SceneDocumentProblem.MissingScreen);
        });
    });

    describe('and a screen of it is opened', () => {
        const result = openSubject({ documentText: JSON.stringify(stored), screen: 'Invoices' });

        it('should open', () => result.opened.should.be.true);
        it('should open it as the screen the editor works on', () => (result.opened && authoredRoot(result.subject.document)!.id).should.equal('invoices'));
        it('should leave the other screens as they are', () => (result.opened && result.subject.document.screens.map(screen => screen.name)).should.deep.equal(['Home', 'Screen']));
    });

    describe('and a screen that is not in it is opened', () => {
        it('should refuse it', () => openSubject({ documentText: JSON.stringify(stored), screen: 'Nope' }).opened.should.be.false);
    });

    describe('and the screen that was opened is saved', () => {
        const opened = withScreenAsPrimary(stored, 'Invoices');
        const restored = withScreenRestored(opened, 'Invoices');

        it('should come back with every screen under the name it had', () => restored.should.deep.equal(stored));
        it('should come back with the screens in the order they had', () => screenNamesOf(restored).should.deep.equal(['Home', 'Invoices']));
        it('should be left as it is when no screen was chosen', () => (withScreenRestored(opened) === opened).should.be.true);
    });

    describe('and a document that holds a screen called Screen is saved', () => {
        const withScreen: SceneDocument = { ...stored, screens: [...stored.screens, named('Screen', 'plain')] };
        const restored = withScreenRestored(withScreenAsPrimary(withScreen, 'Invoices'), 'Invoices');

        it('should still swap the two back', () => restored.should.deep.equal(withScreen));
    });
});
