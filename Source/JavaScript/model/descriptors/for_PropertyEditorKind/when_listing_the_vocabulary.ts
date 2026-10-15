// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory, PropertyEditorKind, componentCategories } from '../index';

describe('when listing the property editor vocabulary', () => {
    const ids = Object.values(PropertyEditorKind) as string[];

    // Spec 8.1 and 8.2: the editor ids the Studio registry resolves.
    for (const id of ['text', 'number', 'boolean', 'enum', 'select', 'color', 'icon', 'list', 'reference']) {
        it(`should name the generic editor ${id}`, () => ids.should.include(id));
    }

    for (const id of ['navigationTarget', 'renderingSlot', 'slice', 'inheritanceMode', 'template', 'sampleData', 'field', 'columnList']) {
        it(`should name the specific editor ${id}`, () => ids.should.include(id));
    }

    it('should keep the editors that were already named', () => ids.should.include.members(['stringList', 'numberList', 'stringOrList', 'scalar', 'stringMap']));

    it('should not name an editor twice', () => new Set(ids).size.should.equal(ids.length));
});

describe('when listing the component categories', () => {
    it('should offer the eight categories of the spec in the order a picker lists them', () =>
        componentCategories.should.deep.equal(['Navigation', 'Data display', 'Input', 'Actions', 'Layout', 'Feedback', 'Overlay', 'Forms']));

    it('should name each of them as a constant', () => Object.values(ComponentCategory).should.deep.equal(componentCategories));
});
