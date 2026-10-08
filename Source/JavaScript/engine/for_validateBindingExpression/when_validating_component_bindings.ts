// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode, BindingSourceKind, PropertyValueType } from '@cratis/scene.model';
import { validateBindingExpression } from '../validateBindingExpression';

describe('when validating component bindings', () => {
    it('should report missing source components without removing the authored binding', () => {
        const diagnostics = validateBindingExpression(
            { kind: BindingSourceKind.ComponentProperty, componentId: 'missing-table', path: 'selectedItem.id' },
            { componentOutputs: {} },
        );

        diagnostics.map(diagnostic => diagnostic.code).should.contain('unknownComponent');
    });

    it('should report component cycles', () => {
        const diagnostics = validateBindingExpression(
            { kind: BindingSourceKind.ComponentProperty, componentId: 'detail', path: 'value' },
            { componentOutputs: { detail: { value: 'x' } } },
            { targetElementId: 'detail' },
        );

        diagnostics.map(diagnostic => diagnostic.code).should.contain('bindingCycle');
    });

    it('should report type mismatches', () => {
        const diagnostics = validateBindingExpression(
            { path: 'count', expectedValueType: PropertyValueType.String },
            { dataContext: { count: 42 } },
        );

        diagnostics.map(diagnostic => diagnostic.code).should.contain('bindingTypeMismatch');
    });

    it('should reject two way bindings that do not target component properties', () => {
        const diagnostics = validateBindingExpression(
            { path: 'name', mode: BindingMode.TwoWay },
            { dataContext: { name: 'Draft' } },
        );

        diagnostics.map(diagnostic => diagnostic.code).should.contain('unsupportedTwoWayBinding');
    });
});
