// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describe, it } from 'vitest';
import { BindingSourceKind } from '@cratis/scene.model';
import { bindingSourceChoices } from '../bindingSourceChoices';

describe('when collecting binding source choices', () => {
    const choices = bindingSourceChoices({ queryResults: ['AllInvoices'], componentOutputs: ['invoiceTable.selectedItem'] });

    it('should expose every Scene binding source kind', () =>
        choices.map(choice => choice.kind).should.deep.equal([
            BindingSourceKind.DataContext,
            BindingSourceKind.QueryResult,
            BindingSourceKind.ComponentProperty,
            BindingSourceKind.Literal,
        ]));

    it('should enable query and component sources when candidates exist', () =>
        choices.filter(choice => choice.disabled).should.deep.equal([]));
});

describe('when collecting binding source choices with no candidates', () => {
    const choices = bindingSourceChoices({ queryResults: [], componentOutputs: [] });

    it('should keep the unavailable sources visible but disabled', () => {
        (choices.find(choice => choice.kind === BindingSourceKind.QueryResult)!.disabled === true).should.be.true;
        (choices.find(choice => choice.kind === BindingSourceKind.ComponentProperty)!.disabled === true).should.be.true;
    });
});
