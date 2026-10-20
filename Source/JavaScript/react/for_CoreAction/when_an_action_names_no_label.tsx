// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { ExternalComponent } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';

const action = (id: string, properties: Record<string, unknown>) =>
    ({ id, componentName: 'core:action', properties, slots: {} }) as unknown as ExternalComponent;

describe('when an action names no label', () => {
    afterEach(cleanup);
    beforeEach(() => {
        render(<SceneElementView registry={coreComponents} element={{ id: 'screen', children: [
            action('change', { command: 'ChangeBasketQuantity' }),
            action('pii', { command: 'ExportPIIRecords' }),
            action('named', { command: 'RemoveFromBasket', label: 'Remove' }),
        ] } as never} />);
    });

    const text = (id: string) => document.querySelector(`[data-scene-id="${id}"]`)!.textContent;

    it('should read the command as a sentence', () => text('change')!.should.equal('Change basket quantity'));
    it('should keep an acronym in its shape', () => text('pii')!.should.equal('Export PIIRecords'));
    it('should show the label an action names as written', () => text('named')!.should.equal('Remove'));
    it('should draw a button with the toolbar look and the command it runs', () =>
        [document.querySelector('[data-scene-id="change"]')!.className, document.querySelector('[data-scene-id="change"]')!.getAttribute('data-scene-command')].should.deep.equal(['scene-action scene-toolbar-button', 'ChangeBasketQuantity']));
});
