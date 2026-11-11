// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ExtensionComponentManifest } from '@cratis/scene.extensions';
import { ExtensionPackageFrontend, resolveExtensionComponent } from '../index';

const declared = (name: string, kind: 'react' | 'mount', platforms: string[]): ExtensionComponentManifest =>
    ({ name, kind, platforms, properties: [], raises: [] });

describe('when resolving an extension component', () => {
    const extensions: ExtensionPackageFrontend[] = [
        { package: 'Stripe', frontend: { name: 'Stripe', components: [declared('PaymentForm', 'react', ['web']), declared('button', 'mount', ['web'])] } }
    ];
    const runtimeCatalog = { core: ['button', 'text'], 'Cratis.Components': ['button'] };
    const profile = (packages: string[], targetPlatform = 'web'): UiProfile => ({ name: 'p', targetPlatform, packages });

    const bare = resolveExtensionComponent('PaymentForm', profile(['Cratis.Components', 'Stripe']), runtimeCatalog, extensions)!;
    const qualified = resolveExtensionComponent('Stripe.PaymentForm', profile([]), runtimeCatalog, extensions)!;
    const shadowing = resolveExtensionComponent('button', profile(['Cratis.Components', 'Stripe']), runtimeCatalog, extensions)!;
    const runtime = resolveExtensionComponent('text', profile(['Stripe']), runtimeCatalog, extensions)!;
    const wrongPlatform = resolveExtensionComponent('PaymentForm', profile(['Stripe'], 'desktop'), runtimeCatalog, extensions)!;

    it('should resolve a bare extension name through the profile packages', () => bare.resolution.package.should.equal('Stripe'));
    it('should carry the extension declaration', () => bare.extension!.kind.should.equal('react'));
    it('should resolve a package-qualified name directly', () => qualified.resolution.should.deep.equal({ name: 'PaymentForm', package: 'Stripe', shadows: [] }));
    it('should let the last listed package win a shared name, recording what it shadowed', () => {
        shadowing.resolution.package.should.equal('Stripe');
        shadowing.resolution.shadows.should.deep.equal(['Cratis.Components', 'core']);
    });
    it('should resolve a runtime component with no extension declaration', () => {
        runtime.resolution.package.should.equal('core');
        (runtime.extension === undefined).should.be.true;
        runtime.supportsPlatform.should.be.true;
    });
    it('should report an extension that does not support the target platform', () => wrongPlatform.supportsPlatform.should.be.false);
    it('should answer nothing for an unknown name', () => (resolveExtensionComponent('Nope', profile(['Stripe']), runtimeCatalog, extensions) === undefined).should.be.true);
});
