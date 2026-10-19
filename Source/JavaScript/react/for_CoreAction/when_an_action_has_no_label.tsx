// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { ExternalComponent } from '@cratis/scene.model';
import { coreComponents } from '../core';
import { SceneElementView } from '../SceneElementView';

describe('when an action has no label', () => {
    beforeEach(() => {
        render(<SceneElementView registry={coreComponents} dataContext={{}}
            element={{ id: 'screen', children: [
                { id: 'change', componentName: 'core:action', properties: { label: null, command: 'ChangeBasketQuantity' }, slots: {} },
                { id: 'named', componentName: 'core:action', properties: { label: 'Remove', command: 'RemoveFromBasket' }, slots: {} },
            ] as unknown as ExternalComponent[] } as never} />);
    });

    afterEach(cleanup);

    it('should show the command name as words', () => expect(screen.getByRole('button', { name: 'Change basket quantity' })).toBeTruthy());
    it('should keep a label that was authored', () => expect(screen.getByRole('button', { name: 'Remove' })).toBeTruthy());
});
