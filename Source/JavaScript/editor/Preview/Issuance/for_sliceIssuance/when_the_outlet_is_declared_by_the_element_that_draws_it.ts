// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind } from '@cratis/scene.model';
import { sliceIssuanceOf } from '../sliceIssuance';
import type { PreviewScene } from '../../PreviewScene';

// A toolbar that no layout or template declares, but the element that draws it does, with its buttons in it: the way the preview's own fixtures draw one.
const scene = {
    layouts: [{ name: 'Plain', slots: [{ name: 'content' }] }],
    screenTemplates: [],
    dialogTemplates: [],
    screens: [{
        name: 'Operations', layout: 'Plain', owner: 'Control.Operations.Overview', forms: [], contributions: [],
        slotContent: { content: [{ id: 'archive-toolbar', componentName: 'core.outletItems', slots: {}, properties: { name: 'toolbar', kind: 'actions', subject: 'screen', items: [{ kind: 'button', id: 'archive', title: 'Archive orders', slice: 'Control.Operations.Archive', opens: 'none' }] } }] },
    }],
    structure: { modules: [{ id: 'Control', name: 'Control', slices: [], features: [{ id: 'Operations', name: 'Operations', features: [], slices: [{ id: 'Archive', name: 'Archive', kind: SliceKind.StateChange, command: 'Archive' }] }] }] },
    commandSchemas: { Archive: '{"properties":{}}' },
} as unknown as PreviewScene;

describe('when the outlet is declared by the element that draws it', () => {
    const archive = sliceIssuanceOf(scene).get('Control.Operations.Archive')!;

    it('should still find the hook that issues the slice', () => archive.issuedFrom.map(hook => hook.button).should.deep.equal(['Archive orders']));
    it('should name the element that draws the outlet', () => archive.issuedFrom[0].outletElementId?.should.equal('archive-toolbar'));
});
