// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApprovalState, ChainOutcome, chainOutcome, effectiveSteps, readSteps } from '../foundation';

const states = (value: unknown) => effectiveSteps(readSteps(value)).map(step => `${step.label}:${step.state}${step.notReached ? '*' : ''}`);
const steps = (...entries: string[]) => entries.map(entry => { const [label, state] = entry.split(':'); return { label, state }; });

describe('when applying the rules of an approval chain', () => {
    it('should read steps with a label and treat an unknown state as pending', () => {
        readSteps([{ label: 'A', state: 'banana' }, { state: 'approved' }, 'x', { label: 'B', approver: 'Bo', comment: '' }]).map(step => `${step.label}:${step.state}`).should.deep.equal(['A:pending', 'B:pending']);
    });

    it('should make the first undecided step current when none is marked', () => {
        states(steps('A:approved', 'B:pending', 'C:pending')).should.deep.equal(['A:approved', 'B:current', 'C:pending']);
    });

    it('should keep the step marked current and demote any other', () => {
        states(steps('A:pending', 'B:current', 'C:current')).should.deep.equal(['A:pending', 'B:current', 'C:pending']);
    });

    it('should stop at a rejection and mark every later step as not reached', () => {
        states(steps('A:approved', 'B:rejected', 'C:pending', 'D:approved')).should.deep.equal(['A:approved', 'B:rejected', 'C:skipped*', 'D:skipped*']);
    });

    it('should have no current step once rejected', () => states(steps('A:rejected', 'B:current')).should.deep.equal(['A:rejected', 'B:skipped*']));

    it('should report the outcome of the chain', () => {
        chainOutcome(readSteps(steps('A:approved', 'B:approved'))).should.equal(ChainOutcome.Approved);
        chainOutcome(readSteps(steps('A:approved', 'B:skipped'))).should.equal(ChainOutcome.Approved);
        chainOutcome(readSteps(steps('A:approved', 'B:rejected'))).should.equal(ChainOutcome.Rejected);
        chainOutcome(readSteps(steps('A:approved', 'B:pending'))).should.equal(ChainOutcome.InProgress);
        chainOutcome(readSteps(steps('A:pending', 'B:pending'))).should.equal(ChainOutcome.Pending);
        chainOutcome([]).should.equal(ChainOutcome.Pending);
        ApprovalState.Current.should.equal('current');
    });
});
