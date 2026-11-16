// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { selectGuardedAction } from '@cratis/scene.engine';
import { GuardOperator, type GuardedActionFallback } from '@cratis/scene.model';
import { withSampleProperties } from '../designTimeSamples';

describe('when drawing a guarded command action that has set nothing', () => {
    const drawn = withSampleProperties('core:guarded-action', 'guarded-action', {});

    it('should have a label', () => (drawn.label as string).should.be.a('string').and.not.equal(''));
    it('should choose a branch rather than hide', () => selectGuardedAction(drawn.alternatives as unknown[], drawn.item, drawn.otherwise as GuardedActionFallback).kind.should.equal('otherwise'));
    it('should name no command, so a click at design time dispatches nothing', () => {
        ((drawn.otherwise as GuardedActionFallback).command === undefined).should.equal(true);
        (drawn.alternatives as unknown[]).should.deep.equal([]);
    });
});

describe('when drawing a guarded command action whose guards the author set', () => {
    const alternatives = [{ command: 'Approve', condition: { kind: 'comparison', left: { subject: 'item.status' }, operator: GuardOperator.Equal, right: 'Open' } }];
    const drawn = withSampleProperties('core:guarded-action', 'guarded-action', { alternatives });

    it('should keep the authored alternatives', () => (drawn.alternatives as unknown[]).should.deep.equal(alternatives));
    it('should fill the rest from the sample', () => {
        (drawn.item as object).should.deep.equal({});
        (drawn.otherwise as GuardedActionFallback).should.be.an('object');
    });
});
