// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { LayoutItem } from '../../Layouts/LayoutItem';
import type { Panel } from '@cratis/scene.model';
import { spliceContent } from '../spliceContent';

const place = createExternalComponent('place', 'Place', 'text');
const sidebar = createExternalComponent('sidebar', 'Sidebar', 'text');
const screen = createExternalComponent('screen', 'Screen', 'text');
const shell = createPanel(LayoutItem.Stack, 'shell', 'Shell', [sidebar, createPanel(LayoutItem.Stack, 'main', 'Main', [place])]);

describe('when putting the screen in the shell', () => {
    const result = spliceContent(shell, 'place', screen) as Panel;
    const main = result.children[1] as Panel;

    it('should put the screen where the place was', () => main.children[0].should.equal(screen));
    it('should keep the rest of the shell as it was', () => result.children[0].should.equal(sidebar));
    it('should not change the shell it was given', () => ((shell.children[1] as Panel).children[0]).should.equal(place));
});

describe('when the place is not in the tree', () => {
    it('should return the very same tree', () => spliceContent(shell, 'missing', screen).should.equal(shell));
});
