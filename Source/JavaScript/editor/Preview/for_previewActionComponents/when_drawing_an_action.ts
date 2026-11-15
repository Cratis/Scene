// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { componentRegistryKey } from '@cratis/scene.react';
import { previewActionComponents } from '../previewActionComponents';
import { an_action as element } from './given/an_action';
const action = previewActionComponents[componentRegistryKey('core', 'action')];

describe('when drawing an action without a label', () => {
    const markup = renderToStaticMarkup(createElement(action, { element, slots: {} }));

    it('should draw a styled button', () => markup.should.contain('class="studio-preview-action"'));
    it('should humanize its command', () => markup.should.contain('>Change basket quantity</button>'));
    it('should keep its scene identity', () => markup.should.contain('data-scene-id="change-quantity"'));
    it('should not submit an enclosing form', () => markup.should.contain('type="button"'));
});

describe('when drawing an action with a label', () => {
    const markup = renderToStaticMarkup(createElement(action, { element: { ...element, properties: { ...element.properties, label: 'Change quantity' } }, slots: {} }));

    it('should draw the supplied label', () => markup.should.contain('>Change quantity</button>'));
});
