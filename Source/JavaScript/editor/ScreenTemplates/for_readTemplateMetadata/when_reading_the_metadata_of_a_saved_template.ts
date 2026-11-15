// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceKind, TemplateScope } from '@cratis/scene.model';
import { readTemplateMetadata } from '../readTemplateMetadata';

const id = '00000000-0000-4000-8000-000000000123';
const documentWith = (metadata: unknown, name = id) => JSON.stringify({ screenTemplates: [{ name: 'other' }, { name, metadata }] });

describe('when reading the metadata of a saved template', () => {
    it('should read the category, the scopes and the slice kinds', () => {
        readTemplateMetadata(documentWith({ category: ' Workspace ', scopes: ['Module', 'Feature'], sliceKinds: ['StateChange'] }), id)
            .should.deep.equal({ category: 'Workspace', scopes: [TemplateScope.Module, TemplateScope.Feature], sliceKinds: [SliceKind.StateChange] });
    });

    it('should find the template whatever the case of its identifier', () => {
        readTemplateMetadata(documentWith({ category: 'Form' }, id.toUpperCase()), id).should.deep.equal({ category: 'Form' });
    });

    it('should leave out what the document does not record', () => readTemplateMetadata(documentWith({}), id).should.deep.equal({}));
    it('should drop a scope Scene does not know', () => readTemplateMetadata(documentWith({ scopes: ['Galaxy', 'Slice'] }), id).should.deep.equal({ scopes: [TemplateScope.Slice] }));
    it('should leave out a blank category', () => readTemplateMetadata(documentWith({ category: '  ' }), id).should.deep.equal({}));
    it('should yield nothing for a template the document does not hold', () => readTemplateMetadata(documentWith({ category: 'x' }, 'someone-else'), id).should.deep.equal({}));
    it('should yield nothing for a document that is not JSON', () => readTemplateMetadata('{ nope', id).should.deep.equal({}));
    it('should yield nothing when there is no document yet', () => readTemplateMetadata(undefined, id).should.deep.equal({}));
});
