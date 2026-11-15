// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Panel, SceneElement } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { projectToLegacyElements } from '../../PrototypeProjection/projectToLegacyElements';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../screenEditorRuntime';
import { serverPrototypeTypes } from '../serverPrototypeTypes';

// The elements the editor saves for everything its palette can add, written down so the server's specifications can read
// every one of them through the real serializer. Run with UPDATE_PROJECTED_PALETTE=1 to write the file again.
const fixture = join(dirname(fileURLToPath(import.meta.url)), '../given/projectedPaletteElements.json');

type Projected = { id: string; _derivedTypeId: string; componentName: string; properties: Record<string, unknown>; slots: { children?: Projected[] } };

const identity = (index: number): string => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;

function projectEverything(): Projected[] {
    let next = 1;
    const elements = new Map<string, Projected>();
    const remember = (projected: Projected[]) => {
        for (const element of projected) {
            elements.set(`${element._derivedTypeId}|${element.componentName}`, element);
        }
    };

    for (const bundle of blueprintPreviewBundles) {
        // The package the profile lists last is the one a bare component name resolves to, so each package gets its turn.
        const packages = [...blueprintPreviewBundles.map(other => other.manifest.name).filter(name => name !== bundle.manifest.name), bundle.manifest.name];
        const runtime = createScreenEditorRuntime(blueprintPreviewBundles, { name: 'palette', targetPlatform: 'web', packages } as never);
        const children = bundle.manifest.components.map(component =>
            createExternalComponent(identity(next++), component, component, { label: component, canvas: undefined }) as unknown as SceneElement);
        remember(projectToLegacyElements({ children } as unknown as Panel, runtime.legacyTypeOf) as Projected[]);
    }

    const runtime = createScreenEditorRuntime(blueprintPreviewBundles, { name: 'palette', targetPlatform: 'web', packages: blueprintPreviewBundles.map(bundle => bundle.manifest.name) } as never);
    const layouts = Object.values(LayoutItem).map(item => {
        const inside = [createExternalComponent(identity(next++), 'Save', 'button', { label: 'Save' }), createExternalComponent(identity(next++), 'Title', 'text', { text: 'Hello' })] as unknown as SceneElement[];
        return createPanel(item, identity(next++), item, inside) as unknown as SceneElement;
    });
    const projectedLayouts = projectToLegacyElements({ children: layouts } as unknown as Panel, runtime.legacyTypeOf) as Projected[];
    for (const layout of projectedLayouts) elements.set(`${layout._derivedTypeId}|${layout.componentName}`, layout);
    return [...elements.values()];
}

describe('when projecting everything the palette offers for the readers that still draw elements', () => {
    const projected = projectEverything();

    if (process.env.UPDATE_PROJECTED_PALETTE === '1') writeFileSync(fixture, `${JSON.stringify(projected, null, 2)}\n`);

    it('should project all six layout containers', () =>
        projected.map(element => element._derivedTypeId).filter(type => type.startsWith('StudioLayout.')).sort().should.deep.equal(['Canvas', 'Container', 'Grid', 'Row', 'Stack', 'Wrap'].map(name => `StudioLayout.${name}`)));
    it('should keep the elements inside a layout container', () => projected.filter(element => element._derivedTypeId.startsWith('StudioLayout.')).every(element => element.slots.children?.length === 2).should.be.true);
    it('should write only types the server registers', () =>
        projected.map(element => element._derivedTypeId).filter(type => type !== 'externalComponent' && !serverPrototypeTypes.has(type)).should.deep.equal([]));
    it('should save a component no server type exists for as an external component', () =>
        projected.some(element => element._derivedTypeId === 'externalComponent' && element.componentName === 'Text').should.be.true);
    it('should match the file the server specifications read', () => {
        (existsSync(fixture)).should.be.true;
        JSON.parse(readFileSync(fixture, 'utf8')).should.deep.equal(JSON.parse(JSON.stringify(projected)));
    });
});
