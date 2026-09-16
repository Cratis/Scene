// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Runtime-only module: import dynamically beneath ArcRuntimeBoundary, never through the barrel.
import type { ComponentProps } from 'react';
import { QueryFor, ObservableQueryFor } from '@cratis/arc/queries';
import { Command } from '@cratis/arc/commands';
import { DataTableForQuery, DataTableForObservableQuery } from '@cratis/components/DataTables';
import { DataPage } from '@cratis/components/DataPage';
import { CommandDialog, StepperCommandDialog } from '@cratis/components/CommandDialog';
import type { BoundConstructor } from './BoundConstructor';
import { requireArcProxy } from './requireArcProxy';

type QueryProps<T> = Omit<T, 'query'> & { query: BoundConstructor };
type CommandProps<T> = Omit<T, 'command'> & { command: BoundConstructor };

// Scene carries property names and argument objects, not compile-time row schemas. These adapters
// support generated object/collection queries, as required by the Components public prop contracts.
export function BoundDataTable({ query, ...props }: QueryProps<ComponentProps<typeof DataTableForQuery>>) {
    return <DataTableForQuery {...props} query={requireArcProxy(query, QueryFor<object, object>, 'query')} />;
}

export function BoundObservableDataTable({ query, ...props }: QueryProps<ComponentProps<typeof DataTableForObservableQuery>>) {
    return <DataTableForObservableQuery {...props} query={requireArcProxy(query, ObservableQueryFor<object, object>, 'observable query')} />;
}

export function BoundDataPage({ query, ...props }: QueryProps<ComponentProps<typeof DataPage>>) {
    const base = query.prototype instanceof ObservableQueryFor ? ObservableQueryFor<object, object> : QueryFor<object, object>;
    // This chooses only the kind of the supplied constructor, never another registered binding.
    const proxy = requireArcProxy<QueryFor<object, object> | ObservableQueryFor<object, object>>(query, base, 'query');
    return <DataPage {...props} query={proxy} />;
}

export function BoundCommandDialog({ command, ...props }: CommandProps<ComponentProps<typeof CommandDialog>>) {
    return <CommandDialog {...props} command={requireArcProxy(command, Command<object, object>, 'command')} />;
}

export function BoundStepperCommandDialog({ command, ...props }: CommandProps<ComponentProps<typeof StepperCommandDialog>>) {
    return <StepperCommandDialog {...props} command={requireArcProxy(command, Command<object, object>, 'command')} />;
}
