// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope } from '@cratis/scene.model';
import { screenTemplateTarget } from '../screenTemplateTarget';

const shell = { name: 'AppShell', slots: [{ name: 'content' }] };
const later = { name: 'AppShell', slots: [{ name: 'content' }, { name: 'side' }] };

describe('when choosing a template for a screen', () => {
    it('should be for a slice unless the host says otherwise', () => screenTemplateTarget({ bundles: [], profile: {} }).scope.should.equal(TemplateScope.Slice));
    it('should use the scope the host gives', () => screenTemplateTarget({ bundles: [], profile: {}, scope: TemplateScope.Application }).scope.should.equal(TemplateScope.Application));
    it('should put the template into the profile\'s shell layout', () => screenTemplateTarget({ bundles: [{ layouts: [shell] }], profile: { layout: 'AppShell' } }).container!.slots.should.deep.equal([{ name: 'content' }]));
    it('should take the layout of the package listed last', () => screenTemplateTarget({ bundles: [{ layouts: [shell] }, { layouts: [later] }], profile: { layout: 'AppShell' } }).container!.slots.length.should.equal(2));
    it('should name no container when the profile names no layout', () => (screenTemplateTarget({ bundles: [{ layouts: [shell] }], profile: {} }).container === undefined).should.be.true);
    it('should name no container when no package has the layout', () => (screenTemplateTarget({ bundles: [], profile: { layout: 'Missing' } }).container === undefined).should.be.true);
});
