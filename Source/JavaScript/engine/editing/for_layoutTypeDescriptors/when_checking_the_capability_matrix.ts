// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutChildPlacement, LayoutType } from '@cratis/scene.model';
import { layoutTypeDescriptors } from '../index';

describe('when checking the capability matrix', () => {
    const types = Object.values(LayoutType);

    it('should describe every layout type exactly once', () => {
        types.length.should.be.greaterThan(0);
        layoutTypeDescriptors.map(descriptor => descriptor.type).should.have.members(types);
        layoutTypeDescriptors.length.should.equal(types.length);
    });

    it('should only offer conversions to layout types that exist', () => {
        for (const descriptor of layoutTypeDescriptors) descriptor.capabilities.convertibleTo.forEach(target => types.should.include(target));
    });

    it('should make every conversion mutual', () => {
        for (const descriptor of layoutTypeDescriptors) {
            for (const target of descriptor.capabilities.convertibleTo) {
                layoutTypeDescriptors.find(candidate => candidate.type === target)!.capabilities.convertibleTo.should.include(descriptor.type);
            }
        }
    });

    it('should give leaf types no children', () => {
        for (const type of [LayoutType.FlowLeaf, LayoutType.FlowSlotLeaf]) {
            layoutTypeDescriptors.find(descriptor => descriptor.type === type)!.capabilities.acceptsChildren.should.be.false;
        }
    });

    it('should order flow containers and position freeform ones', () => {
        const placementOf = (type: LayoutType) => layoutTypeDescriptors.find(descriptor => descriptor.type === type)!.capabilities.childPlacement;
        placementOf(LayoutType.FlowRow).should.equal(LayoutChildPlacement.Ordered);
        placementOf(LayoutType.Freeform).should.equal(LayoutChildPlacement.Positioned);
        placementOf(LayoutType.Canvas).should.equal(LayoutChildPlacement.Positioned);
    });

    it('should support grid span only where a grid is involved', () => {
        layoutTypeDescriptors.filter(descriptor => descriptor.capabilities.supportsGridSpan && descriptor.capabilities.acceptsChildren)
            .map(descriptor => descriptor.type).should.have.members([LayoutType.FlowGrid, LayoutType.GridPanel]);
    });

    it('should give editable properties unique paths within a type', () => {
        for (const descriptor of layoutTypeDescriptors) {
            const paths = descriptor.properties.map(property => property.path);
            new Set(paths).size.should.equal(paths.length);
        }
    });
});
