// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from '@cratis/scene.model';
import { generateChecklistItemsAction } from '../designTime';
import { aChecklist, aDesignTimeContext } from '../for_inspectionsPackage/given/a_design_time_host';

describe('when generating fields', () => {
    it('should produce one required item per command property, deterministically', () => {
        const { context } = aDesignTimeContext(aChecklist({ command: 'RecordInspection' }), []);
        const first = generateChecklistItemsAction.execute(context);
        first.should.deep.equal(generateChecklistItemsAction.execute(context));
        first.edits.should.deep.equal([{
            kind: SceneEditKind.SetProperty,
            nodeId: 'checklist',
            path: 'items',
            value: [
                { id: 'checklist.siteId', property: 'siteId', label: 'Site Id', required: true },
                { id: 'checklist.fireExitsClear', property: 'fireExitsClear', label: 'Fire exits are clear', required: true },
            ],
        }]);
    });

    it('should refuse to overwrite authored items', () => {
        const { context } = aDesignTimeContext(aChecklist({ command: 'RecordInspection', items: [] }), []);
        const result = generateChecklistItemsAction.execute(context);
        result.edits.should.be.empty;
        result.diagnostics.should.not.be.empty;
    });
});
