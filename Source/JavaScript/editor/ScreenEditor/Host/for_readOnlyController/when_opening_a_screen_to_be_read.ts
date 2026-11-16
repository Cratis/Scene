// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { InspectedProperty, NodeInspection } from '@cratis/scene.model';
import { StructureEditRejection } from '../../Structure/StructureEditRejection';
import type { ScreenEditorController } from '../ScreenEditorController';
import { readOnlyController } from '../readOnlyController';

const property = { editable: true, operations: ['add'] } as unknown as InspectedProperty;
const inspection = { nodeId: 'title', removable: true, properties: [property] } as unknown as NodeInspection;
const calls: string[] = [];
const editing = {
    selectedId: 'title',
    inspection,
    dropRegions: [{}],
    select: (id: string) => calls.push(`select ${id}`),
    remove: () => calls.push('remove'),
    insertComponent: () => calls.push('insert'),
    setProperty: () => calls.push('set'),
    canRemove: () => true,
    canUndo: true,
    canRedo: true,
    isDirty: true,
} as unknown as ScreenEditorController;

describe('when opening a screen to be read', () => {
    const controller = readOnlyController(editing, 'Done');
    controller.remove('title');
    controller.insertComponent('Button', undefined, undefined);
    controller.setProperty(property, 'x');
    controller.select('title');

    it('should still select', () => calls.should.deep.equal(['select title']));
    it('should lock every property with the reason', () => controller.inspection!.properties[0].should.include({ editable: false, reason: 'Done' }));
    it('should offer no collection operations', () => controller.inspection!.properties[0].operations!.should.be.empty);
    it('should not let the selection be removed', () => controller.inspection!.removable.should.be.false);
    it('should not say anything can be removed', () => controller.canRemove('title').should.be.false);
    it('should offer nowhere to drop', () => controller.dropRegions.should.be.empty);
    it('should refuse moves', () => controller.validateMove({} as never)!.should.equal(StructureEditRejection.NodeLocked));
    it('should have nothing to undo or redo', () => (controller.canUndo || controller.canRedo).should.be.false);
    it('should never be unsaved', () => controller.isDirty.should.be.false);
});
