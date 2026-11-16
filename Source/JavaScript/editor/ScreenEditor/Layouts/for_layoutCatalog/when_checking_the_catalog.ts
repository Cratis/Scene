// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowContainerKind } from '@cratis/scene.model';
import { layoutCatalog } from '../layoutCatalog';
import { LayoutItem } from '../LayoutItem';
import { toLayoutContainerDescriptors, type LayoutLabels } from '../toLayoutContainerDescriptors';

describe('when checking the layout catalog against Scene', () => {
    it('should map every flow primitive Scene has', () =>
        Object.values(FlowContainerKind).filter(kind => !layoutCatalog.some(entry => entry.flowKind === kind)).should.deep.equal([]));

    it('should offer every author-facing layout item exactly once', () =>
        Object.values(LayoutItem).every(item => layoutCatalog.filter(entry => entry.item === item).length === 1).should.be.true);

    it('should use a distinct component type for each item', () =>
        new Set(layoutCatalog.map(entry => entry.type)).size.should.equal(layoutCatalog.length));

    it('should offer Stack, Row, Grid and Container', () =>
        [LayoutItem.Stack, LayoutItem.Row, LayoutItem.Grid, LayoutItem.Container].every(item => layoutCatalog.some(entry => entry.item === item)).should.be.true);
});

describe('when turning the catalog into descriptors', () => {
    const labels = Object.fromEntries(Object.values(LayoutItem).map(item => [item, `Label ${item}`])) as LayoutLabels;
    const descriptors = toLayoutContainerDescriptors(layoutCatalog, labels);

    it('should take each name from the host\'s labels', () => descriptors[0].name.should.equal('Label stack'));
    it('should keep the arrangement of the entry', () => descriptors.map(descriptor => descriptor.arrangement).should.deep.equal(layoutCatalog.map(entry => entry.arrangement)));
});
