// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource } from '@cratis/scene.model';
import { TemplateReferenceKind } from '../TemplateReferenceKind';
import { referenceOfApplicableTemplate } from '../referenceOfApplicableTemplate';

describe('when choosing an applicable template', () => {
    it('should store a blueprint template by its name', () => {
        referenceOfApplicableTemplate({ reference: { source: TemplateReferenceSource.Blueprint, id: 'ModuleWorkspace', blueprint: 'Cratis.Blueprint.Default', version: '^1.0.0' } })
            .should.deep.equal({ kind: TemplateReferenceKind.Blueprint, id: 'ModuleWorkspace' });
    });

    it('should store an own template by its identifier', () => {
        referenceOfApplicableTemplate({ reference: { source: TemplateReferenceSource.Own, id: '00000000-0000-4000-8000-000000000123' } })
            .should.deep.equal({ kind: TemplateReferenceKind.Application, id: '00000000-0000-4000-8000-000000000123' });
    });
});
