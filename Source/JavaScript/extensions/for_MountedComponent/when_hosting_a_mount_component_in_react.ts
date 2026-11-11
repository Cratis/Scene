// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { createExtensionContext, ExtensionProperties, MountedComponent, MountFactory } from '../index';
import { a_rendered_tree } from '../for_hooks/given/a_rendered_tree';

describe('when hosting a mount component in react', () => {
    const log: string[] = [];
    const mount: MountFactory = (host, properties, context) => {
        log.push(`mount:${String(properties.label)}:${context.user.name}`);
        return { update: next => log.push(`update:${String(next.label)}`), unmount: () => log.push('unmount') };
    };
    const tree = new a_rendered_tree(createExtensionContext({ user: { id: '1', name: 'Ada', roles: [], signedIn: true } }));
    const render = (properties: ExtensionProperties) => tree.render(createElement(MountedComponent, { mount, properties }));

    beforeAll(async () => {
        await render({ label: 'a' });
        await render({ label: 'b' });
        await tree.dispose();
    });

    it('should mount once with the properties and the ambient context', () => log[0].should.equal('mount:a:Ada'));
    it('should update when the properties change, and unmount at the end', () => log.slice(1).should.deep.equal(['update:b', 'unmount']));
});
