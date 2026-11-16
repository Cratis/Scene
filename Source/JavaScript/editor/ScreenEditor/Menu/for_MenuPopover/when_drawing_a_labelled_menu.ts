// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuPopover } from '../MenuPopover';

const draw = (props: { label?: string; disabled?: boolean; disabledReason?: string }) =>
    renderToStaticMarkup(createElement(MenuPopover, { icon: 'i', title: 'Components', heading: 'Components', closeLabel: 'Close', ...props } as never, 'body'));

describe('when drawing a menu with a label', () => {
    const markup = draw({ label: 'Components' });

    it('should draw the name beside the icon', () => markup.should.contain('<span class="studio-menu-popover__label">Components</span>'));
    it('should draw the button as a labelled one', () => markup.should.contain('studio-menu-popover__trigger--labelled'));
    it('should still name the button for assistive technology', () => markup.should.contain('aria-label="Components"'));
});

describe('when drawing a menu with no label', () => {
    const markup = draw({});

    it('should draw no name beside the icon', () => markup.should.not.contain('studio-menu-popover__label'));
    it('should leave the button enabled', () => markup.should.not.contain('disabled'));
});

describe('when drawing a disabled menu with a reason', () => {
    const markup = draw({ label: 'Components', disabled: true, disabledReason: 'Opened to read' });

    it('should disable the button', () => markup.should.match(/<button[^>]*\sdisabled/));
    it('should give the reason as the button\'s title', () => markup.should.match(/<button[^>]*title="Opened to read"/));
    it('should not draw the menu as open', () => markup.should.not.contain('data-open'));
});
