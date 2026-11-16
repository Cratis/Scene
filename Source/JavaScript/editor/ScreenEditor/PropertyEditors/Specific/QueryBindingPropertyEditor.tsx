// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { QueryBinding } from '@cratis/scene.model';
import { QueryBindingEditor } from '../../Inspector/QueryBindingEditor';
import { ParameterFeedsSection } from '../../Inspector/DataBindingSections';
import { isQueryBinding } from '../../Binding/queryBindingModel';
import { createBindingScope } from '../../Binding/bindingScopeTypes';
import { settleBinding } from '../../Binding/settleBinding';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// Binds a data component to a query: the existing query-binding editor, offered under its registry id so the sidebar and a popover resolve it alike.
export const QueryBindingPropertyEditor = ({ value, onChange, context, disabled }: PropertyEditorProps<QueryBinding>) => {
    const { session } = context;
    if (!session) return null;
    const binding = isQueryBinding(value) ? value : undefined;
    const candidate = binding ? context.lookups.queryCandidates.find(known => known.id === binding.queryId) : undefined;
    return (
        <>
            <QueryBindingEditor
                property={session.property} candidates={context.lookups.queryCandidates} scope={session.bindingScope} strings={session.screenStrings}
                disabled={disabled === true} onChange={onChange} />
            {binding && candidate && <ParameterFeedsSection controller={session.controller} environment={session.environment} strings={session.screenStrings} binding={binding} candidate={candidate} disabled={disabled === true}
                // A route value is not among the sources the scope lists unless a query is named after it, so it is offered to Scene as the type of the parameter it feeds.
                onChange={(next, parameter, path) => {
                    const scope = path === '' ? session.bindingScope : createBindingScope({ ...session.bindingScope.types, [path]: parameter.type });
                    if (settleBinding(session.property.descriptor, candidate, next, scope).isStorable) onChange(next);
                }} />}
        </>
    );
};
