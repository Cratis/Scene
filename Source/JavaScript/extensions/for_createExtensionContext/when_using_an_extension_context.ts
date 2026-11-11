// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createExtensionContext } from '../createExtensionContext';
import { ExtensionContextPart } from '../ExtensionContext';

describe('when changing an extension context', () => {
    const controller = createExtensionContext();
    const parts: ExtensionContextPart[] = [];
    const unsubscribe = controller.context.subscribe(part => parts.push(part));
    const originalLocale = controller.context.locale;
    const originalTheme = controller.context.theme;
    const user = { id: 'u1', name: 'Ada', roles: ['reader'], signedIn: true };

    controller.update({ user, theme: { colorScheme: 'dark', tokens: { '--x': '1' } } });
    controller.update({ locale: originalLocale });

    it('should expose the new user', () => controller.context.user.should.equal(user));
    it('should notify once per changed part, in order', () => parts.should.deep.equal(['user', 'theme']));
    it('should not notify for a part given back unchanged', () => parts.should.not.include('locale'));
    it('should keep the identity of an unchanged part', () => controller.context.locale.should.equal(originalLocale));
    it('should replace a changed part', () => controller.context.theme.should.not.equal(originalTheme));
    it('should advance the version once per change', () => controller.context.version.should.equal(2));

    unsubscribe();
});

describe('when invoking without a host service', () => {
    it('should reject loudly', () => createExtensionContext().context.invoke('Pay').then(() => 'passed', (error: Error) => error.message).then(message => message.should.match(/cannot invoke 'Pay'/)));
});

describe('when the host provides invoke and raise', () => {
    const raised: Array<[string, unknown]> = [];
    const controller = createExtensionContext({
        invoke: async (ability, inputs) => ({ echoed: `${ability}:${String(inputs.amount)}` }),
        raise: (signal, values) => raised.push([signal, values])
    });

    it('should answer an invocation', async () => (await controller.context.invoke('Pay', { amount: 5 })).should.deep.equal({ echoed: 'Pay:5' }));
    it('should deliver a raised signal', () => {
        controller.context.raise('succeeded', { id: 'x' });
        raised.should.deep.equal([['succeeded', { id: 'x' }]]);
    });
});

describe('when subscribing to a trigger', () => {
    const controller = createExtensionContext();
    const received: unknown[] = [];
    const stop = controller.context.on('PaymentSucceeded', values => received.push(values));
    controller.trigger('PaymentSucceeded', { id: 1 });
    controller.trigger('Other', { id: 2 });
    const openBefore = controller.subscriberCount;
    stop();
    stop();
    controller.trigger('PaymentSucceeded', { id: 3 });

    it('should deliver only the named trigger', () => received.should.deep.equal([{ id: 1 }]));
    it('should count the subscription while open', () => openBefore.should.equal(1));
    it('should release the subscription, however often it is disposed', () => controller.subscriberCount.should.equal(0));
});

describe('when rendering a slot with the default host', () => {
    const controller = createExtensionContext();
    const host = document.createElement('div');
    const dispose = controller.context.renderSlot(host, 'toolbar');
    const whileRendered = host.querySelector('[data-extension-slot="toolbar"]');
    dispose();

    it('should render the slot into the host', () => (whileRendered !== null).should.be.true);
    it('should remove it when disposed', () => host.childNodes.length.should.equal(0));
});
