// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { InspectedProperty } from '@cratis/scene.model';
import { visibleProperties } from '../visibleProperties';

const property = (path: string) => ({ descriptor: { path } }) as InspectedProperty;
const all = [property('label'), property('Canvas.Left'), property('Canvas.Top')];
const paths = (shown: InspectedProperty[]) => shown.map(each => each.descriptor.path);

describe('when the element is held by a canvas', () => {
    it('should show its placement', () => paths(visibleProperties(all, true, {})).should.deep.equal(['label', 'Canvas.Left', 'Canvas.Top']));
});

describe('when the element is held by something that is not a canvas', () => {
    it('should not show a placement that does nothing there', () => paths(visibleProperties(all, false, {})).should.deep.equal(['label']));
    it('should show one it already has, so it can be taken off', () => paths(visibleProperties(all, false, { 'Canvas.Left': 4 })).should.deep.equal(['label', 'Canvas.Left']));
});
