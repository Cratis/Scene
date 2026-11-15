// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ComponentRegistry } from '@cratis/scene.react';
import { designTimeRegistry } from '../designTimeRegistry';
import type { SurfaceStrings } from '../SurfaceStrings';

const strings: SurfaceStrings = {
    emptyContainer: '', dropDenied: '', moveHandle: name => name, overlay: name => name, sampleContent: () => '', dropTarget: () => '', declaration: name => name, unavailable: name => `${name} unavailable`, nothingToShow: name => name, failedToDraw: name => name,
};
const provided = () => null;
const registry = designTimeRegistry({ 'core:text': provided } as unknown as ComponentRegistry, strings);

describe('when asking for a component the profile provides', () => {
    it('should answer with a component drawn for design time, not the one the runtime has', () => {
        (typeof registry['core:text']).should.equal('function');
        (registry['core:text'] === provided).should.be.false;
    });
});

describe('when asking for a component the profile does not provide', () => {
    it('should still answer, so it is drawn as a note instead of the renderer\'s own fallback', () => (typeof registry['Acme:widget']).should.equal('function'));
    it('should answer with the same component each time, so it is not remounted on every render', () => (registry['Acme:widget'] === registry['Acme:widget']).should.be.true);
});

describe('when the runtime registry is looked at afterwards', () => {
    it('should be untouched', () => {
        const runtime = { 'core:text': provided } as unknown as ComponentRegistry;
        designTimeRegistry(runtime, strings);
        (runtime['core:text'] === provided).should.be.true;
    });
});
