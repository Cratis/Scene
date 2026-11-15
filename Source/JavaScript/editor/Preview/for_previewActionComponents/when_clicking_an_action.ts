// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { vi } from 'vitest';
import { previewActionClick } from '../previewActionClick';
import { an_action } from './given/an_action';

const element = {
    ...an_action,
    properties: {
        command: 'ChangeBasketQuantity',
        arguments: [{ name: 'lineId', source: 'item.lineId' }, { name: 'quantity', source: 'component.quantity.value' }, { name: 42, source: 'item.lineId' }],
    },
};

describe('when clicking an action', () => {
    let commands: CustomEvent[];

    beforeEach(() => {
        commands = [];
        vi.stubGlobal('dispatchEvent', (event: CustomEvent) => { commands.push(event); return true; });
        const scope = { dataContext: { item: { lineId: 'line-1' } }, componentOutputs: { quantity: { value: 2 } } };
        const click = previewActionClick(element, scope);
        scope.componentOutputs.quantity.value = 3;
        click();
    });

    afterEach(() => vi.unstubAllGlobals());

    it('should dispatch exactly one Scene command event', () => {
        commands.should.have.lengthOf(1);
        commands[0].type.should.equal('cratis.scene.command');
    });
    it('should preserve the command and original element', () => {
        commands[0].detail.command.should.equal('ChangeBasketQuantity');
        commands[0].detail.element.should.equal(element);
    });
    it('should resolve named arguments at click time from the row and component outputs', () => commands[0].detail.arguments.should.deep.equal({ lineId: 'line-1', quantity: 3 }));
});

describe('when clicking an action without arguments', () => {
    let command: CustomEvent;

    beforeEach(() => {
        vi.stubGlobal('dispatchEvent', (event: CustomEvent) => { command = event; return true; });
        previewActionClick({ ...element, properties: { command: 'RemoveLine' } }, {})();
    });

    afterEach(() => vi.unstubAllGlobals());

    it('should still dispatch its command', () => command.detail.command.should.equal('RemoveLine'));
    it('should dispatch an empty argument mapping', () => command.detail.arguments.should.deep.equal({}));
});
