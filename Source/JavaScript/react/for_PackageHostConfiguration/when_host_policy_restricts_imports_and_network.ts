// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { PackageHostPolicy, resolvePackageHost } from '../packages/PackageHostConfiguration';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';
import { isNetworkAsset } from '../packages/isNetworkAsset';

const bundle = (assets: string[], designTime = false): ScenePackageBundle => ({
    manifest: {
        name: 'Vendor.Kit', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [], assets,
        ...(designTime ? { designTime: { previews: [], designers: [], propertyEditors: [], propertyDisplays: [], actions: [] } } : {}),
    },
    components: {},
    ...(designTime ? { designTime: {} } : {}),
});

const resolve = (assets: string[], policy: PackageHostPolicy, designTime = false) =>
    resolvePackageHost({ bundles: [bundle(assets, designTime)], profile: { name: 'p', targetPlatform: 'web', packages: ['Vendor.Kit'] }, policy });

const closed: PackageHostPolicy = { allowExecutableImports: false, allowNetworkAssets: false };

describe('when host policy restricts imports and network access', () => {
    it('should treat absolute and protocol-relative URLs as network assets, and package paths and data URLs as local', () => {
        ['https://cdn.example/a.css', 'HTTP://cdn.example/a.css', '//cdn.example/font.woff2', 'wss://live.example', 'ftp://files.example/x'].every(isNetworkAsset).should.equal(true);
        ['styles/kit.css', './fonts/kit.woff2', '@vendor/kit/styles', 'data:font/woff2;base64,AAAA', 'blob:abc'].some(isNetworkAsset).should.equal(false);
    });

    it('should block network assets and name them', () => {
        const host = resolve(['styles/kit.css', '//cdn.example/font.woff2', 'https://cdn.example/kit.css'], closed);
        host.blocked.should.equal(true);
        host.assets.should.deep.equal([]);
        host.diagnostics.should.deep.equal(["Package 'Vendor.Kit' declares network assets (//cdn.example/font.woff2, https://cdn.example/kit.css), but host policy forbids them"]);
    });

    it('should load network assets when the policy allows them', () =>
        resolve(['https://cdn.example/kit.css'], { ...closed, allowNetworkAssets: true }).assets.should.deep.equal(['https://cdn.example/kit.css']));

    it('should block executable design-time contributions when the policy forbids executable imports', () =>
        resolve([], { ...closed, loadDesignTime: true }, true).diagnostics.should.deep.equal(["Package 'Vendor.Kit' provides executable design-time contributions, but host policy forbids them"]));

    it('should allow them when the policy allows executable imports', () =>
        resolve([], { ...closed, loadDesignTime: true, allowExecutableImports: true }, true).blocked.should.equal(false));

    it('should not consider design-time contributions in a runtime host', () =>
        resolve([], closed, true).blocked.should.equal(false));
});
