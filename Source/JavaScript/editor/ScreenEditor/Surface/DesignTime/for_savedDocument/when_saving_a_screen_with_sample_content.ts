// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createExternalComponent } from '../../../Document/createExternalComponent';
import { placementBelow, placeOnCanvas } from '../../../Document/placeOnCanvas';
import { withSampleProperties } from '../designTimeSamples';

describe('when an element that shows sample content is part of the saved screen', () => {
    const element = createExternalComponent('t', 'Tag', 'tag', {}) as unknown as { properties: Record<string, unknown> };
    const drawn = withSampleProperties('PrimeReact:tag', 'tag', element.properties);
    const asSaved = JSON.stringify(element);

    it('should be drawn with the sample', () => drawn.value!.should.equal('Tag'));
    it('should hold no sample value itself', () => ('value' in element.properties).should.be.false);
    it('should save no sample value', () => asSaved.should.not.contain('"value"'));
    it('should carry no sample marking', () => asSaved.should.not.contain('studio-sample'));
});

describe('when an element placed on a canvas shows sample content', () => {
    const placed = placeOnCanvas(createExternalComponent('t', 'Tag', 'tag', {}) as unknown as { properties: Record<string, unknown> } & Parameters<typeof placeOnCanvas>[0], placementBelow([])) as unknown as { properties: Record<string, unknown> };

    it('should save its position and nothing of the sample', () => Object.keys(placed.properties).sort().should.deep.equal(['Canvas.Left', 'Canvas.Top']));
});
