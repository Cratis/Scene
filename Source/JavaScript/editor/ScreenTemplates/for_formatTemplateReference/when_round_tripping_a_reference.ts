// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceKind } from '../TemplateReferenceKind';
import { formatTemplateReference } from '../formatTemplateReference';
import { parseTemplateReference } from '../parseTemplateReference';

describe('when round tripping a template reference through storage', () => {
    it('should keep a blueprint template', () => {
        const reference = { kind: TemplateReferenceKind.Blueprint, id: 'ModuleWorkspace' };
        parseTemplateReference(formatTemplateReference(reference))!.should.deep.equal(reference);
    });

    it('should keep an application template', () => {
        const reference = { kind: TemplateReferenceKind.Application, id: '00000000-0000-4000-8000-000000000123' };
        parseTemplateReference(formatTemplateReference(reference))!.should.deep.equal(reference);
    });

    it('should store nothing chosen as an empty value', () => {
        formatTemplateReference(undefined).should.equal('');
    });
});
