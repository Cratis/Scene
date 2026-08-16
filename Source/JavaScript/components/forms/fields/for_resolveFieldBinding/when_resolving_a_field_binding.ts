// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { externalComponent } from '../../../given';
import { resolveFieldBinding } from '../resolveFieldBinding';

describe('when resolving a field binding', () => {
    describe('and the element names a property with a title and description', () => {
        const binding = resolveFieldBinding(
            externalComponent('Cratis.Components:inputTextField', {
                property: 'customerName',
                title: 'Customer',
                description: 'Who the invoice is for',
            })
        )!;

        it('should read the named property off the command instance', () => binding.value({ customerName: 'Acme' })!.should.equal('Acme'));
        it('should use the declared title', () => binding.title.should.equal('Customer'));
        it('should carry the description', () => binding.description!.should.equal('Who the invoice is for'));
    });

    describe('and the element names only a property', () => {
        const binding = resolveFieldBinding(externalComponent('Cratis.Components:inputTextField', { property: 'customerName' }))!;

        it('should fall back to the property name as the title', () => binding.title.should.equal('customerName'));
        it('should carry no description', () => (binding.description === undefined).should.be.true);
    });

    describe('and the element names no property', () => {
        const binding = resolveFieldBinding(externalComponent('Cratis.Components:inputTextField', { title: 'Customer' }));

        it('should resolve to nothing rather than an accessor that reads nothing', () => (binding === undefined).should.be.true);
    });
});
