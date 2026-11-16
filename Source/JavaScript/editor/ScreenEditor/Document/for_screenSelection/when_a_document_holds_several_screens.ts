// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { authoredRoot, createScreenDocument } from '../studioScreen';
import { createPanel } from '../createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { screenNamesOf, withScreenAsPrimary } from '../screenSelection';
import { openSubject } from '../../Host/openSubject';

const twoScreens = (): SceneDocument => {
    const document = createScreenDocument(createPanel(LayoutItem.Stack, 'first', 'First'));
    const second = createScreenDocument(createPanel(LayoutItem.Stack, 'second', 'Second')).screens[0]!;
    return { ...document, screens: [...document.screens, { ...second, name: 'SupplierPage' }] };
};

describe('when a document holds several screens', () => {
    const document = twoScreens();
    const swapped = withScreenAsPrimary(document, 'SupplierPage');
    const restored = withScreenAsPrimary(swapped, 'SupplierPage');

    it('should list the screen called Screen first', () => screenNamesOf({ ...document, screens: [...document.screens].reverse() }).should.deep.equal(['Screen', 'SupplierPage']));
    it('should make the chosen screen the one called Screen', () => authoredRoot(swapped)!.id.should.equal('second'));
    it('should keep the other screen under the chosen name', () => swapped.screens.find(screen => screen.name === 'SupplierPage')!.slotContent.content![0]!.id.should.equal('first'));
    it('should come back exactly as it was when swapped again', () => restored.should.deep.equal(document));
    it('should not change the document when the screen is the one called Screen', () => (withScreenAsPrimary(document, 'Screen') === document).should.be.true);
    it('should not change the document when the screen is unknown', () => (withScreenAsPrimary(document, 'Nope') === document).should.be.true);
    it('should not change the document when no screen is chosen', () => (withScreenAsPrimary(document) === document).should.be.true);
});

describe('when opening another screen of a document', () => {
    const result = openSubject({ documentText: JSON.stringify(twoScreens()), screen: 'SupplierPage', screenTemplate: 'DataListPage' });

    it('should open it as the screen the editor works on', () => (result.opened && authoredRoot(result.subject.document)!.id).should.equal('second'));
    it('should not rebase it on the template chosen for the slice', () => (result.opened && result.subject.document.screens.every(screen => screen.screenTemplate === undefined)).should.be.true);
});
