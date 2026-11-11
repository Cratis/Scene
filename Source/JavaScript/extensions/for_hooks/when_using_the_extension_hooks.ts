// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
    createExtensionContext, useExtensionContext, useInvoke, useLocale, useRaise, useStrings, useTrigger, useUser
} from '../index';
import { a_rendered_tree } from './given/a_rendered_tree';

describe('when a hook reads the context', () => {
    const renders = { user: 0, locale: 0 };
    const tree = new a_rendered_tree(createExtensionContext({
        user: { id: '1', name: 'Ada', roles: [], signedIn: true },
        strings: { hello: 'Hei' }
    }));
    const User = () => { renders.user++; return createElement('i', null, useUser().name); };
    const Locale = () => { renders.locale++; return createElement('b', null, useLocale().language); };
    const Strings = () => { const translate = useStrings(); return createElement('u', null, `${translate('hello')}/${translate('missing')}`); };
    const Whole = () => createElement('s', null, String(useExtensionContext().version));

    beforeAll(async () => {
        await tree.render(createElement(User), createElement(Locale), createElement(Strings), createElement(Whole));
        await tree.change(() => tree.controller.update({ user: { id: '2', name: 'Grace', roles: [], signedIn: true } }));
    });
    afterAll(() => tree.dispose());

    it('should show the changed user', () => tree.host.querySelector('i')!.textContent!.should.equal('Grace'));
    it('should re-render only the hook whose part changed', () => renders.locale.should.equal(1));
    it('should re-render the user hook once for the change', () => renders.user.should.equal(2));
    it('should translate known keys and fall back to the key', () => tree.host.querySelector('u')!.textContent!.should.equal('Hei/missing'));
    it('should re-render the whole-context hook on any change', () => tree.host.querySelector('s')!.textContent!.should.equal('1'));
});

describe('when a hook invokes, raises and listens', () => {
    const raised: string[] = [];
    const seen: string[] = [];
    const tree = new a_rendered_tree(createExtensionContext({
        invoke: async (ability, inputs) => ({ result: `${ability}:${String(inputs.n)}` }),
        raise: signal => raised.push(signal)
    }));
    let invoke: ReturnType<typeof useInvoke>;
    let raise: ReturnType<typeof useRaise>;
    const Probe = () => {
        invoke = useInvoke();
        raise = useRaise();
        useTrigger('Ping', values => seen.push(String(values.n)));
        return null;
    };

    beforeAll(() => tree.render(createElement(Probe)));

    it('should invoke through the host', async () => (await invoke('Do', { n: 1 })).should.deep.equal({ result: 'Do:1' }));
    it('should raise through the host', () => { raise('done'); raised.should.deep.equal(['done']); });
    it('should deliver a trigger while mounted', () => { tree.controller.trigger('Ping', { n: 7 }); seen.should.deep.equal(['7']); });
    it('should unsubscribe from the trigger when unmounted', async () => {
        await tree.dispose();
        tree.controller.trigger('Ping', { n: 8 });
        seen.should.deep.equal(['7']);
        tree.controller.subscriberCount.should.equal(0);
    });
});

describe('when a hook is used outside a provider', () => {
    const Orphan = () => { useUser(); return null; };

    it('should explain that no context is available', () =>
        (() => renderToString(createElement(Orphan))).should.throw(/No extension context/));
});
