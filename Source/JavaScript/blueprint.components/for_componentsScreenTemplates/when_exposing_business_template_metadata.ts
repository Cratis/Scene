// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope } from '@cratis/scene.model';
import { componentsPageTemplates } from '../templates';

describe('when exposing business template metadata', () => {
    it('should categorize list detail and command templates for scoped galleries', () => {
        const categories = new Map(componentsPageTemplates.map(template => [template.name, template.metadata]));

        categories.get('DataListPage')!.category!.should.equal('Business / List');
        categories.get('DataListWithDetailPage')!.category!.should.equal('Business / Master detail');
        categories.get('CommandFormPage')!.category!.should.equal('Business / Command');
        categories.get('CommandFormPage')!.scopes!.should.deep.equal([TemplateScope.Slice]);
    });
});
