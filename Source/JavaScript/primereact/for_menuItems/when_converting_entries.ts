// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MenuItem } from '../MenuItem';
import { toMenuItems } from '../menuItems';

describe('when converting entries', () => {
    describe('and an entry is a bare string', () => {
        it('should use it as the label', () => {
            toMenuItems(['File']).should.deep.equal([{ label: 'File' }]);
        });
    });

    describe('and an entry carries submenus', () => {
        const items = toMenuItems([{ label: 'File', icon: 'pi pi-file', items: [{ label: 'Open', items: ['Recent'] }] }]);

        it('should keep the label and icon', () => {
            items[0].label!.should.equal('File');
            items[0].icon!.should.equal('pi pi-file');
        });

        it('should follow the nesting to any depth, because a menubar and a tiered menu differ only in depth', () => {
            const submenu = items[0].items as MenuItem[];
            const nested = submenu[0].items as MenuItem[];
            nested[0].label!.should.equal('Recent');
        });
    });

    describe('and an entry is a separator', () => {
        it('should keep it even though it has no label', () => {
            toMenuItems([{ separator: true }]).should.deep.equal([{ separator: true }]);
        });
    });

    describe('and an entry has no usable label', () => {
        it('should drop it rather than render a blank command', () => {
            toMenuItems([{ icon: 'pi pi-file' }, 7, ['nested'], { label: 'File' }]).should.deep.equal([{ label: 'File' }]);
        });
    });
});
