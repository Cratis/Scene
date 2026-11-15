// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { authorizeOf, enablementPersonaOf, requirementHolds, requirementText } from '../previewPersona';

describe('when a persona is checked against what commands ask', () => {
    const authorizations = new Map<string, readonly string[]>([
        ['Shop.Orders.Archive', ['Admin']],
        ['Shop.Orders.SetPrice', ['Editor', 'Admin', 'or']],
        ['Shop.Orders.Refund', ['Finance', 'Admin', 'and']],
        ['Shop.Orders.Open', []],
    ]);
    const viewer = enablementPersonaOf({ name: 'Viewer', policies: [] }, authorizations);
    const editor = enablementPersonaOf({ name: 'Editor', policies: ['Editor'] }, authorizations);
    const admin = enablementPersonaOf({ name: 'Admin', policies: ['Admin', 'Finance'] }, authorizations);

    it('should read a single policy as its own name', () => authorizeOf(['Admin'])!.should.equal('Admin'));
    it('should read several policies as one line', () => requirementText(['Editor', 'Admin', 'or']).should.equal('(Editor or Admin)'));
    it('should authorize nothing for a command open to everyone', () => (authorizeOf([]) === undefined).should.be.true);
    it('should hold an alternative when one side is held', () => requirementHolds(['Editor', 'Admin', 'or'], new Set(['Editor'])).should.be.true);
    it('should not hold a conjunction when one side is missing', () => requirementHolds(['Finance', 'Admin', 'and'], new Set(['Admin'])).should.be.false);
    it('should keep the name of the persona', () => editor.name.should.equal('Editor'));
    it('should not give a persona without policies what a command asks', () => viewer.policies.should.deep.equal([]));
    it('should give a persona the alternative it satisfies', () => editor.policies.should.include('(Editor or Admin)'));
    it('should not give a persona the conjunction it does not satisfy', () => editor.policies.should.not.include('(Finance and Admin)'));
    it('should give a persona that holds both the conjunction', () => admin.policies.should.include('(Finance and Admin)'));
});
