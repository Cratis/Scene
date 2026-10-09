// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEdit, SceneEditKind } from '@cratis/scene.model';
import { DesignTimeAction, DesignTimeActionContext } from '../packages/DesignTimeAction';
import { runDesignTimeAction } from '../packages/runDesignTimeAction';

describe('when running a design-time action', () => {
    const submitted: SceneEdit[][] = [];
    const context = { element: { id: 'node' }, submitAction: (_: string, edits: SceneEdit[]) => submitted.push(edits) } as unknown as DesignTimeActionContext;
    const actionReturning = (execute: DesignTimeAction['execute']): DesignTimeAction => ({
        descriptor: { id: 'Vendor.action', label: 'Act' }, isVisible: () => true, isEnabled: () => true, execute,
    });

    beforeEach(() => (submitted.length = 0));

    it('should submit a canonical batch once', () => {
        const edits: SceneEdit[] = [{ kind: SceneEditKind.SetProperty, nodeId: 'node', path: 'title', value: 'x' }];
        runDesignTimeAction(actionReturning(() => ({ edits, diagnostics: [] })), context).submitted.should.be.true;
        submitted.should.deep.equal([edits]);
    });

    it('should reject a batch containing a non-canonical edit as a whole', () => {
        const edits = [{ kind: SceneEditKind.SetProperty, nodeId: 'node', path: 'a', value: 1 }, { kind: 'writeFile', path: '/etc' }] as unknown as SceneEdit[];
        const outcome = runDesignTimeAction(actionReturning(() => ({ edits, diagnostics: [] })), context);
        outcome.submitted.should.be.false;
        outcome.diagnostics.should.deep.equal(["Action 'Vendor.action' produced 1 edit(s) that are not canonical Scene edits; nothing was submitted"]);
        submitted.should.be.empty;
    });

    it('should report a failing action instead of submitting anything', () => {
        const outcome = runDesignTimeAction(actionReturning(() => { throw new Error('metadata unavailable'); }), context);
        outcome.should.deep.equal({ submitted: false, edits: [], diagnostics: ["Action 'Vendor.action' failed: Error: metadata unavailable"] });
        submitted.should.be.empty;
    });
});
