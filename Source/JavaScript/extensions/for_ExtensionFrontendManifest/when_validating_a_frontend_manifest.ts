// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExtensionFrontendManifest, findExtensionComponent, supportsPlatform, validateFrontendManifest } from '../index';

const component = (name: string, kind: 'react' | 'mount', platforms: string[]) => ({ name, kind, platforms, properties: [], raises: [] });

describe('when validating a frontend manifest', () => {
    const sound: ExtensionFrontendManifest = {
        name: 'Stripe',
        components: [component('PaymentForm', 'react', ['web']), component('Chart', 'mount', ['web', 'desktop'])]
    };
    const broken: ExtensionFrontendManifest = {
        name: 'Broken',
        components: [component('A', 'react', ['web', 'ios']), component('A', 'mount', []), component('B', 'mount', ['web'])]
    };

    it('should accept a sound manifest', () => validateFrontendManifest(sound).should.deep.equal([]));
    it('should report a duplicate name, a missing platform and a non-web React component', () => validateFrontendManifest(broken).should.deep.equal([
        "Component 'A' is React, which is web-only.",
        "Component 'A' is declared more than once.",
        "Component 'A' declares no platform."
    ]));
    it('should find a component by name', () => findExtensionComponent(sound, 'Chart')!.kind.should.equal('mount'));
    it('should not find an unknown component', () => (findExtensionComponent(sound, 'Nope') === undefined).should.be.true);
    it('should answer whether a component supports a platform', () => {
        supportsPlatform(sound.components[1], 'desktop').should.be.true;
        supportsPlatform(sound.components[0], 'desktop').should.be.false;
    });
});
