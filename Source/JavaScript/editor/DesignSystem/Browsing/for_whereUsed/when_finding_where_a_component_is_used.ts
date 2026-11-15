// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { whereUsed } from '../whereUsed';

const screenplay = [
    'layout AppShell',
    '  category application',
    '  topbar',
    '    component Button',
    '  content',
    '',
    'module Workspaces',
    '  screen template Sheet',
    '    category Page',
    '    content',
    '      component Card',
    '      component ButtonGroup',
    '',
    'ui profile Desktop',
    '  theme Product',
    '',
].join('\n');

describe('when finding where a component is used', () => {
    it('should name the layout that mentions it', () => whereUsed(screenplay, 'Button').should.deep.equal(['layout AppShell']));
    it('should name a template with the module it sits in', () => whereUsed(screenplay, 'Card').should.deep.equal(['screen template Workspaces.Sheet']));
    it('should not take a longer name for the component', () => whereUsed(screenplay, 'ButtonGroup').should.deep.equal(['screen template Workspaces.Sheet']));
    it('should find nothing for a component the screenplay does not name', () => whereUsed(screenplay, 'Chip').should.deep.equal([]));
    it('should name each place once', () => whereUsed(screenplay.replace('  content\n\nmodule', '  content\n    component Button\n\nmodule'), 'Button').should.deep.equal(['layout AppShell']));
});
