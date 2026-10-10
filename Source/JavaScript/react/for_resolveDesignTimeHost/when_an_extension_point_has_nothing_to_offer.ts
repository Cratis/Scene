// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, PackageKind, PropertyValueType } from '@cratis/scene.model';
import { DesignTimeExtensionPoint } from '../packages/DesignTimeExtensionPoint';
import { DesignTimeActionContext } from '../packages/DesignTimeAction';
import { resolveDesignTimeHost } from '../packages/resolveDesignTimeHost';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';

/**
 * Every versioned extension point, including any added later, must degrade to the host's generic surface
 * with a reason - in a runtime-only host, and in a design-time host whose package does not provide it.
 */
const descriptor: ComponentDescriptor = {
    component: 'Vendor.Package:widget',
    displayName: 'Widget',
    previewKind: 'widgetPreview',
    editorKind: 'widgetDesigner',
    propertyDisplayKind: 'widgetDisplay',
    properties: [{ path: 'value', label: 'Value', group: 'Content', valueType: PropertyValueType.String, editorKind: 'widgetEditor' }],
    actions: [{ id: 'Vendor.Package.widget.act', label: 'Act' }],
};

const bundle = (designTime: ScenePackageBundle['designTime'], declared: boolean): ScenePackageBundle => ({
    manifest: {
        name: 'Vendor.Package', version: '1.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: ['widget'],
        layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
        ...(declared ? { designTime: { contractVersion: '1.0', previews: [], designers: [], propertyEditors: [], propertyDisplays: [], actions: [] } } : {}),
    },
    components: { 'Vendor.Package:widget': () => null },
    descriptors: [descriptor],
    designTime,
});

function lookupsFor(bundles: ScenePackageBundle[], loadDesignTime: boolean) {
    const host = resolveDesignTimeHost({
        bundles,
        profile: { name: 'p', targetPlatform: 'web', packages: ['Vendor.Package'] },
        policy: { allowExecutableImports: true, allowNetworkAssets: false, loadDesignTime },
    });
    const context = {} as DesignTimeActionContext;
    return {
        [DesignTimeExtensionPoint.Preview]: () => host.preview(descriptor),
        [DesignTimeExtensionPoint.Designer]: () => host.designer(descriptor),
        [DesignTimeExtensionPoint.PropertyEditor]: () => host.propertyEditor(descriptor, descriptor.properties[0]),
        [DesignTimeExtensionPoint.PropertyDisplay]: () => host.propertyDisplay(descriptor),
        [DesignTimeExtensionPoint.Action]: () => {
            const [action] = host.actions(descriptor, context);
            return { contribution: action.enabled ? action : undefined, diagnostic: action.diagnostic };
        },
    } satisfies Record<DesignTimeExtensionPoint, () => { contribution?: unknown; diagnostic?: string }>;
}

describe('when an extension point has nothing to offer', () => {
    const cases = {
        'a runtime-only host': lookupsFor([bundle(undefined, true)], false),
        'a design-time host whose package provides nothing': lookupsFor([bundle({}, true)], true),
        'a design-time host whose package declares nothing': lookupsFor([bundle(undefined, false)], true),
    };

    for (const [name, lookups] of Object.entries(cases)) {
        for (const point of Object.values(DesignTimeExtensionPoint)) {
            it(`should fall back with a reason for the ${point} extension point in ${name}`, () => {
                const resolution = lookups[point]();
                (resolution.contribution === undefined).should.equal(true);
                (resolution.diagnostic ?? '').length.should.be.greaterThan(0);
            });
        }
    }
});
