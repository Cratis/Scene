// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isOperationPermitted } from '../isOperationPermitted';
import { Ownership } from '../Ownership';
import { StructureOperation } from '../StructureOperation';

const structural = [StructureOperation.Move, StructureOperation.Resize, StructureOperation.Restyle, StructureOperation.Insert, StructureOperation.Delete];

describe('when checking what local content allows', () => {
    it('should allow every operation', () =>
        Object.values(StructureOperation).every(operation => isOperationPermitted(Ownership.Local, operation)).should.be.true);
});

describe('when checking what inherited content allows', () => {
    it('should allow selecting it for inspection', () => isOperationPermitted(Ownership.Inherited, StructureOperation.Select).should.be.true);
    it('should not allow configuring it', () => isOperationPermitted(Ownership.Inherited, StructureOperation.Configure).should.be.false);
    it('should block every structural operation', () =>
        structural.some(operation => isOperationPermitted(Ownership.Inherited, operation)).should.be.false);
});

describe('when checking what configurable inherited content allows', () => {
    it('should allow selecting it', () => isOperationPermitted(Ownership.ConfigurableInherited, StructureOperation.Select).should.be.true);
    it('should allow configuring its exposed settings', () => isOperationPermitted(Ownership.ConfigurableInherited, StructureOperation.Configure).should.be.true);
    it('should still block every structural operation', () =>
        structural.some(operation => isOperationPermitted(Ownership.ConfigurableInherited, operation)).should.be.false);
});
