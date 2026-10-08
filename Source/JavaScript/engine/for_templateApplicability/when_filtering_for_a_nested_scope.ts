// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { filterApplicableScreenTemplates } from '../index';

describe('when filtering templates for a recursively nested feature', () => {
    const custom: ScreenTemplate = { name: 'custom', fitsSlot: 'parent.body', slots: [], metadata: { type: 'Acme.Workspace', category: 'Acme/Dispatch' } };
    const legacy: ScreenTemplate = { name: 'legacy', fitsSlot: 'body', slots: [] };
    const templates: ScreenTemplate[] = [
        custom,
        { name: 'wrongScope', slots: [], metadata: { scopes: [TemplateScope.Slice] } },
        { name: 'wrongSlot', slots: [], fitsSlot: 'other.body' },
        legacy,
        { name: 'shell', slots: [], metadata: { type: 'ApplicationShell' } },
    ];
    let result: ScreenTemplate[];
    beforeEach(() => {
        result = filterApplicableScreenTemplates(templates, TemplateScope.Subfeature, { name: 'parent', slots: [{ name: 'body' }] });
    });
    it('should preserve the original order of applicable templates', () => result.map(template => template.name).should.deep.equal(['custom', 'legacy']));
    it('should preserve the selected template rather than making an editable copy of inherited visuals', () => result[0].should.equal(custom));
    it('should preserve unknown package metadata', () => result[0].metadata!.category!.should.equal('Acme/Dispatch'));
});
