// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceKind } from '../TemplateReferenceKind';
import { parseTemplateReference } from '../parseTemplateReference';

describe('when reading a stored template value', () => {
    it('should read an empty value as nothing chosen', () => {
        (parseTemplateReference('') === undefined).should.be.true;
    });

    it('should read a missing value as nothing chosen', () => {
        (parseTemplateReference(undefined) === undefined).should.be.true;
    });

    it('should read a name as a blueprint template', () => {
        parseTemplateReference('CrudList')!.should.deep.equal({ kind: TemplateReferenceKind.Blueprint, id: 'CrudList' });
    });

    it('should read an identifier as an application template', () => {
        parseTemplateReference('00000000-0000-4000-8000-000000000123')!.kind.should.equal(TemplateReferenceKind.Application);
    });
});
