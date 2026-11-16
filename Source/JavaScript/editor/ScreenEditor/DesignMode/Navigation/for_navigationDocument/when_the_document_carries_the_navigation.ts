// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationRegionKind } from '@cratis/scene.model';
import { createPanel } from '../../../Document/createPanel';
import { readSceneDocument } from '../../../Document/readSceneDocument';
import { createScreenDocument } from '../../../Document/studioScreen';
import { LayoutItem } from '../../../Layouts/LayoutItem';
import { changeDocumentInSession, openSession, redo, undo } from '../../../Session/EditSession';
import { applicationNavigation, regionSource, titlesOf } from '../given/applicationNavigation';
import { emptyNavigation, navigationOf, ownItemsOf, withNavigation } from '../navigationDocument';

const empty = createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', []), undefined);

describe('when a document has no navigation', () => {
    it('should read as an application with no regions', () => navigationOf(empty).should.deep.equal(emptyNavigation()));
});

describe('when a document carries the navigation of the application', () => {
    const document = withNavigation(empty, applicationNavigation());
    it('should hand the same navigation back', () => navigationOf(document).should.deep.equal(applicationNavigation()));
    it('should leave the document it was given alone', () => (('navigation' in empty)).should.be.false);
    it('should survive being stored and read again, as the editor opens a document', () => {
        const read = readSceneDocument(JSON.stringify(document));
        read.readable.should.be.true;
        titlesOf(navigationOf((read as { document: typeof document }).document), NavigationRegionKind.Topbar, undefined).should.deep.equal(['Dashboard', 'Sales', 'Support']);
    });
});

describe('when the navigation is changed in the editing session', () => {
    const start = openSession(withNavigation(empty, applicationNavigation()));
    const outcome = regionSource(NavigationRegionKind.Topbar, undefined).add('addItem');
    const changed = 'rejected' in outcome ? start : changeDocumentInSession(start, withNavigation(start.document, { ...applicationNavigation(), application: { ...applicationNavigation().application, outlets: [] } }), outcome.label);
    it('should be one undo step, like any other change', () => changed.undoable.should.have.length(1));
    it('should be undone and redone with the rest of the document', () => {
        navigationOf(undo(changed).document).application.outlets.should.have.length(2);
        navigationOf(redo(undo(changed)).document).application.outlets.should.have.length(0);
    });
    it('should make the session dirty', () => changed.isDirty.should.be.true);
});

describe('when reading the items a level owns', () => {
    const navigation = applicationNavigation();
    it('should read the application items', () => ownItemsOf(navigation, undefined, NavigationRegionKind.Topbar).map(item => item.id).should.deep.equal(['dashboard', 'sales', 'support']));
    it('should read a module\'s own items', () => ownItemsOf(navigation, 'sales', NavigationRegionKind.Sidebar).map(item => item.id).should.deep.equal(['orders', 'customers', 'pipeline']));
    it('should read nothing for a module that inherits the region', () => ownItemsOf(navigation, 'sales', NavigationRegionKind.Topbar).should.be.empty);
});
