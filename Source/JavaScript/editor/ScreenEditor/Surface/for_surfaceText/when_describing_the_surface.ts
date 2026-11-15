// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DropRegionKind } from '../../DropRegions/DropRegionKind';
import { dropAnnouncement, selectedNameOf } from '../surfaceText';
import type { DragFeedback } from '../useSurfaceDrop';

const strings = { dropDenied: 'denied', dropTarget: (where: 'into' | 'between') => `target ${where}` };
const dropOf = (kind: DropRegionKind) => ({ target: { region: { kind } } }) as unknown as DragFeedback['drop'];

describe('when describing the surface', () => {
    it('should name nothing when nothing is selected', () => selectedNameOf(undefined).should.equal(''));
    it('should name an element by its name', () => selectedNameOf({ name: 'Header', componentName: 'Text' }).should.equal('Header'));
    it('should name an element without a name by its component', () => selectedNameOf({ componentName: 'Text' }).should.equal('Text'));
    it('should name an element with neither as nothing', () => selectedNameOf({}).should.equal(''));

    it('should announce nothing when nothing is dragged', () => dropAnnouncement(undefined, strings).should.equal(''));
    it('should announce a denied drop', () => dropAnnouncement({ denied: true, drop: dropOf(DropRegionKind.Container) }, strings).should.equal('denied'));
    it('should announce a drag with no drop as denied', () => dropAnnouncement({ denied: false }, strings).should.equal('denied'));
    it('should announce a drop into a container', () => dropAnnouncement({ denied: false, drop: dropOf(DropRegionKind.Container) }, strings).should.equal('target into'));
    it('should announce a drop between elements', () => dropAnnouncement({ denied: false, drop: dropOf(DropRegionKind.Between) }, strings).should.equal('target between'));
});
