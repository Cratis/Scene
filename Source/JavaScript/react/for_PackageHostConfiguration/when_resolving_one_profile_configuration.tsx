// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { BindingSourceKind, ExternalComponent, PackageKind, PropertyValueType, ScenePackage } from '@cratis/scene.model';
import { RegisteredComponentProps } from '../renderer';
import { PackageHostConfiguration, resolvePackageHost } from '../packages/PackageHostConfiguration';
import { PackageHostView } from '../packages/PackageHostView';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';
import { resolveDesignTimeHost } from '../packages/resolveDesignTimeHost';

function Greeting({ element }: RegisteredComponentProps) {
    return <p>{String(element.properties.text)}</p>;
}

const manifest = (name: string, overrides: Partial<ScenePackage> = {}): ScenePackage => ({
    name, version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [], ...overrides,
});

const widgets: ScenePackageBundle = {
    manifest: manifest('Acme.Widgets', {
        components: ['greeting'],
        assets: ['styles/widgets.css', 'fonts/acme.woff2'],
        designTime: { contractVersion: '1.0', previews: ['greetingPreview'], designers: [], propertyEditors: [], propertyDisplays: [], actions: [] },
    }),
    components: { 'Acme.Widgets:greeting': Greeting },
    descriptors: [{ component: 'Acme.Widgets:greeting', displayName: 'Greeting', previewKind: 'greetingPreview', properties: [{ path: 'text', label: 'Text', group: 'Content', valueType: PropertyValueType.String }] }],
    designTime: { previews: { greetingPreview: () => <p>preview</p> } },
};

const shell: ScenePackageBundle = {
    manifest: manifest('Acme.Shell', { kind: PackageKind.Blueprint, dependencies: [{ name: 'Acme.Widgets' }], layouts: ['Workspace'], themes: ['Harbor'] }),
    components: {},
    layouts: [{ name: 'Workspace', slots: [{ name: 'content' }] }],
    themes: [{ name: 'Harbor', compatibleWith: ['Acme.Shell', 'Acme.Widgets'], tokens: { primary: '#0a5' } }],
};

const configuration: PackageHostConfiguration = {
    bundles: [widgets, shell],
    profile: { name: 'harbor', targetPlatform: 'web', packages: ['Acme.Shell'], layout: 'Workspace', theme: 'Harbor' },
    policy: { allowExecutableImports: true, allowNetworkAssets: false, loadDesignTime: true },
};

describe('when resolving one profile configuration', () => {
    it('should resolve components, assets, layout and theme from the profile and its dependencies', () => {
        const host = resolvePackageHost(configuration);
        host.diagnostics.should.deep.equal([]);
        host.bundles.map(bundle => bundle.manifest.name).should.deep.equal(['Acme.Widgets', 'Acme.Shell']);
        Object.keys(host.components).should.include('Acme.Widgets:greeting');
        host.assets.should.deep.equal(['styles/widgets.css', 'fonts/acme.woff2']);
        host.fonts.should.deep.equal(['fonts/acme.woff2']);
        host.layout!.name.should.equal('Workspace');
        host.theme!.name.should.equal('Harbor');
    });

    it('should drive design-time extensions from the same configuration', () =>
        (resolveDesignTimeHost(configuration).preview(widgets.descriptors![0]).contribution !== undefined).should.equal(true));

    it('should resolve bindings against the rendered profile', () => {
        const element = { id: 'hello', componentName: 'Acme.Widgets:greeting', properties: { text: { kind: BindingSourceKind.DataContext, path: 'user.name' } }, slots: {} } as unknown as ExternalComponent;
        render(<PackageHostView configuration={configuration} element={element} dataContext={{ user: { name: 'Ada' } }} />);
        Boolean(screen.getByText('Ada')).should.equal(true);
    });

    it('should block a profile whose layout or theme no approved package provides', () =>
        resolvePackageHost({ ...configuration, profile: { ...configuration.profile, layout: 'Kiosk', theme: 'Midnight' } }).diagnostics.should.deep.equal([
            "UI profile 'harbor' uses layout 'Kiosk', which no approved package provides",
            "UI profile 'harbor' uses theme 'Midnight', which no approved package provides",
        ]));

    it('should block a theme that is not compatible with every profile package', () => {
        const narrow = { ...shell, themes: [{ name: 'Harbor', compatibleWith: ['Acme.Widgets'] }] };
        const host = resolvePackageHost({ ...configuration, bundles: [widgets, narrow] });
        host.blocked.should.equal(true);
        host.diagnostics.should.deep.equal(["Theme 'Harbor' is not compatible with Acme.Shell in UI profile 'harbor'"]);
        (host.theme === undefined && host.layout === undefined).should.equal(true);
    });
});
