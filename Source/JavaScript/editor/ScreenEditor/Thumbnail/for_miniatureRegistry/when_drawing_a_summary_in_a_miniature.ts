// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { componentRegistryKey, corePackage } from '@cratis/scene.react';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { miniatureRegistry } from '../miniatureRegistry';

// The board's miniature of a form drew its labels with no values, where the editor drew a sample value under each.
const runtime = createScreenEditorRuntime([corePackage], { name: 'p', targetPlatform: 'web', packages: ['core'] } as never);
const summary = createExternalComponent('summary', 'Summary', 'core:summary', { typeName: 'DraftProduct' }, {
    fields: [createExternalComponent('sku', 'sku', 'core:field', { property: 'sku', label: 'SKU' })],
});

describe('when drawing a summary in a miniature', () => {
    const Summary = miniatureRegistry(runtime.registry)[componentRegistryKey('core', 'summary')];
    const markup = renderToStaticMarkup(createElement(Summary, { element: summary } as never));

    it('should draw it with the sample values the editor draws', () => markup.includes('data-design-data="summary"').should.be.true);
    it('should keep the label the screen gives the field', () => markup.includes('SKU').should.be.true);
});
