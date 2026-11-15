// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toComponentCatalog } from '@cratis/scene.engine';
import { corePackage } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { qualifyStoredComponentNames, resolveStoredComponentName, splitStoredComponentName } from '../storedComponentName';

const bundles = [corePackage, primeReactPackage, cratisComponentsPackage];
const catalog = toComponentCatalog(bundles.map(bundle => bundle.manifest));
const profile = { name: 'test', targetPlatform: 'web', packages: bundles.map(bundle => bundle.manifest.name) } as never;
const narrow = { name: 'test', targetPlatform: 'web', packages: [corePackage.manifest.name] } as never;

const tree = (...children: unknown[]) => ({ screens: [{ name: 'Screen', slotContent: { content: [{ id: 'root', children }] } }], layouts: [] });
const element = (id: string, componentName: string, extra: Record<string, unknown> = {}) => ({ id, componentName, properties: {}, slots: {}, ...extra });
const namesOf = (document: ReturnType<typeof tree>) => (document.screens[0].slotContent.content[0].children as { componentName: string }[]).map(child => child.componentName);

describe('when qualifying the names of a document saved with bare component names', () => {
    const saved = tree(element('form', 'commandForm'), element('go', 'core:action'), element('b', 'button'), element('unknown', 'hologram'));
    const qualified = qualifyStoredComponentNames(saved, profile, catalog);

    it('should store the command form under the package the profile resolves it to', () => namesOf(qualified)[0].should.equal(`${resolveStoredComponentName('commandForm', profile, catalog)!.package}:commandForm`));
    it('should leave a name that already has its package', () => namesOf(qualified)[1].should.equal('core:action'));
    it('should store a bare button under a package', () => namesOf(qualified)[2].should.match(/^[^:]+:button$/));
    it('should leave a name no package offers as it is', () => namesOf(qualified)[3].should.equal('hologram'));
    it('should not change the document it was given', () => namesOf(saved)[0].should.equal('commandForm'));
    it('should keep everything else of an element', () => (qualified.screens[0].slotContent.content[0].children[0] as { id: string }).id.should.equal('form'));
});

describe('when qualifying a document that already has packages everywhere', () => {
    const saved = tree(element('go', 'core:action'), element('t', 'core:text'));

    it('should hand back the same document', () => (qualifyStoredComponentNames(saved, profile, catalog) === saved).should.be.true);
});

describe('when qualifying inside a slot of a component', () => {
    const saved = tree(element('card', 'card', { slots: { body: [element('inner', 'text')] } }));
    const qualified = qualifyStoredComponentNames(saved, profile, catalog);

    it('should qualify the nested component', () => ((qualified.screens[0].slotContent.content[0].children[0] as { slots: { body: { componentName: string }[] } }).slots.body[0].componentName).should.match(/^[^:]+:text$/));
});

describe('when resolving a stored name', () => {
    it('should split a qualified name at the first colon', () => splitStoredComponentName('scene:web.DataGrid').should.deep.equal({ package: 'scene', name: 'web.DataGrid' }));
    it('should leave a bare name without a package', () => splitStoredComponentName('button').should.deep.equal({ package: undefined, name: 'button' }));
    it('should resolve a qualified name to its own package', () => resolveStoredComponentName('core:action', profile, catalog)!.should.deep.equal({ package: 'core', name: 'action' }));
    it('should not resolve a qualified name the package does not declare', () => (resolveStoredComponentName('core:hologram', profile, catalog) === undefined).should.be.true);
    it('should not resolve a qualified name of a package the profile does not include', () => (resolveStoredComponentName('PrimeReact:button', narrow, catalog) === undefined).should.be.true);
});
