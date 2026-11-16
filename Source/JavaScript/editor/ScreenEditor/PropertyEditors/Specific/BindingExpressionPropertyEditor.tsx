// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BindingExpression } from '@cratis/scene.model';
import { bindingSourceInventory } from '../../Binding/bindingSources';
import { BindingExpressionEditor } from '../../Inspector/BindingExpressionEditor';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// Binds a property to a value another element, the data context or a query supplies: the existing binding editor, under its registry id.
export const BindingExpressionPropertyEditor = ({ onChange, context, disabled }: PropertyEditorProps<BindingExpression>) => {
    const { session } = context;
    if (!session) return null;
    const { controller, environment } = session;
    const sources = bindingSourceInventory(controller.document, controller.composition.roots, controller.context, environment.availableSources, environment.queryCandidates);
    return <BindingExpressionEditor property={session.property} sources={sources} strings={session.screenStrings} disabled={disabled === true} onChange={onChange} />;
};
