// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind } from '@cratis/scene.model';
import { allBindingSourceKinds, defaultAcceptedBindingKinds, isBindingExpression } from '../bindingExpressionModel';

describe('when recognising a binding', () => {
    it('should understand a command response binding', () => isBindingExpression({ kind: BindingSourceKind.CommandResponse, path: 'projectId' }).should.equal(true));
    it('should not understand a binding of a kind it does not know', () => isBindingExpression({ kind: 'PackageSpecific', path: 'x' }).should.equal(false));
    it('should know the command response kind', () => allBindingSourceKinds.should.include(BindingSourceKind.CommandResponse));
    it('should not accept a command response where a property names no kinds', () => defaultAcceptedBindingKinds.should.not.include(BindingSourceKind.CommandResponse));
});
