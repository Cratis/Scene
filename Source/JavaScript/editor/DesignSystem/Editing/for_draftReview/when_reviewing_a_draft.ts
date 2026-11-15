// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemHistoryEntry } from '../../DesignSystemHost';
import { draftAuthors, mayActivate, waitingForReview } from '../draftReview';

const history: DesignSystemHistoryEntry[] = [
    { version: 1, kind: 'draftStarted', by: 'ada' },
    { version: 1, kind: 'activated', by: 'grace' },
    { version: 2, kind: 'draftStarted', by: 'ada' },
    { version: 2, kind: 'draftRevised', by: 'linus' },
    { version: 2, kind: 'draftRevised', by: 'ada' },
    { version: 2, kind: 'draftRevisedByAssistant', by: 'margaret' },
];

describe('when reviewing a draft', () => {
    const authors = draftAuthors(history, 2);

    it('should name each author once', () => authors.should.deep.equal(['ada', 'linus', 'margaret']));
    it('should not count the people who activated an earlier version', () => draftAuthors(history, 1).should.deep.equal(['ada']));
    it('should not let an author activate it', () => mayActivate(authors, 'linus').should.be.false);
    it('should not let the person who asked an assistant to change it activate it', () => mayActivate(authors, 'margaret').should.be.false);
    it('should let someone else activate it', () => mayActivate(authors, 'grace').should.be.true);
    it('should not let nobody activate it', () => mayActivate(authors, '').should.be.false);

    describe('and it was put up for review', () => {
        // The host gives the newest entry first.
        const submitted: DesignSystemHistoryEntry[] = [{ version: 2, kind: 'draftSubmittedForReview', by: 'grace' }, ...[...history].reverse()];

        it('should say who submitted it', () => waitingForReview(submitted, 2)!.should.equal('grace'));
        it('should not count the submitter as an author', () => draftAuthors(submitted, 2).should.not.include('grace'));
        it('should let the submitter activate it', () => mayActivate(draftAuthors(submitted, 2), 'grace').should.be.true);
        it('should not be waiting once it changed since', () =>
            (waitingForReview([{ version: 2, kind: 'draftRevised', by: 'ada' }, ...submitted], 2) === undefined).should.be.true);
        it('should not be waiting when it was never submitted', () => (waitingForReview([...history].reverse(), 2) === undefined).should.be.true);
    });
});
