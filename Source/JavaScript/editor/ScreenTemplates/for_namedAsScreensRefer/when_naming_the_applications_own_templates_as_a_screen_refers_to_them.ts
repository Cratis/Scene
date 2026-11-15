// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope } from '@cratis/scene.model';
import { namedAsScreensRefer, ownTemplateSourceOf } from '../ownTemplateSource';

describe('when naming the application\'s own templates as a screen refers to them', () => {
    const templates = namedAsScreensRefer([
        { id: '594318e6-f473-4e51-8353-7460130dc8de', name: 'SideSummary', category: 'Shop', scopes: [TemplateScope.Slice], template: { name: '594318e6-f473-4e51-8353-7460130dc8de', slots: [{ name: 'content' }], fitsSlot: 'content' } },
        { id: '11111111-1111-4111-8111-111111111111', name: 'ProductGrid' },
    ]);
    const source = ownTemplateSourceOf(templates);

    it('should call a template by the name its author gave', () => templates.map(template => template.name).should.deep.equal(['SideSummary', 'ProductGrid']));
    it('should keep what the saved document declares', () => templates[0].fitsSlot!.should.equal('content'));
    it('should carry the scopes it was made for', () => templates[0].metadata!.scopes!.should.deep.equal([TemplateScope.Slice]));
    it('should list the same names in the source manifest', () => source.manifest.screenTemplates.should.deep.equal(['SideSummary', 'ProductGrid']));
});
