// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutItem } from '../../Layouts/LayoutItem';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { projectToLegacyElements } from '../projectToLegacyElements';

type Slots = { children?: Projected[] };
type Projected = { id: string; _derivedTypeId: string; componentName: string; slots: Slots };

describe('when a panel added in the editor is projected for the board thumbnails', () => {
    const root = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [
        createPanel(LayoutItem.Row, 'row', 'Row', [createPanel(LayoutItem.Grid, 'grid', 'Grid')]),
        createPanel(LayoutItem.Wrap, 'wrap', 'Wrap'),
    ]);
    const [row, wrap] = projectToLegacyElements(root) as Projected[];

    it('should be written as the layout container it is', () => [row._derivedTypeId, wrap._derivedTypeId].should.deep.equal(['StudioLayout.Row', 'StudioLayout.Wrap']));
    it('should name its class for the readers that use it', () => row.componentName.should.equal('Row'));
    it('should hold its children in the slot the readers use', () => row.slots.children![0]._derivedTypeId.should.equal('StudioLayout.Grid'));
    it('should keep exactly the children it was given', () => row.slots.children!.length.should.equal(1));
});

describe('when a component added in the editor is projected for the board thumbnails', () => {
    const root = createPanel(LayoutItem.Stack, 'r', 'R', [createExternalComponent('x', 'Save', 'button'), createExternalComponent('y', 'Other', 'datePicker')]);

    it('should be written with the type the library offers it as', () =>
        (projectToLegacyElements(root, name => `PrimeReact.${name.charAt(0).toUpperCase()}${name.slice(1)}`) as Projected[]).map(element => element._derivedTypeId).should.deep.equal(['PrimeReact.Button', 'PrimeReact.DatePicker']));
    it('should be written as a generic component when no library offers it', () => (projectToLegacyElements(root) as Projected[])[0]._derivedTypeId.should.equal('externalComponent'));
    it('should keep the class name even then', () => (projectToLegacyElements(root) as Projected[]).map(element => element.componentName).should.deep.equal(['Button', 'DatePicker']));
});

describe('when projecting null scene properties for the earlier thumbnail serializer', () => {
    const component = createExternalComponent('x', 'Action', 'action', { label: 'Check out', optional: null });
    const root = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [component]);
    const [projected] = projectToLegacyElements(root) as Array<{ properties: Record<string, unknown> }>;

    it('should remove nulls only from the thumbnail projection', () => ('optional' in projected.properties).should.be.false);
    it('should retain nulls in the canonical scene document', () => ((component.properties as Record<string, unknown>).optional === null).should.be.true);
});

describe('when nothing is authored', () => {
    it('should project no elements', () => projectToLegacyElements(undefined).should.deep.equal([]));
});
