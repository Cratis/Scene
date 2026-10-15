// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext } from 'react';
import { SliceCommandField } from './SliceCommandField';

/** Tells a task dialog which fields a command has. */
export type SliceCommandFieldsSource = (command: string, sliceId: string) => SliceCommandField[];

const Context = createContext<SliceCommandFieldsSource | undefined>(undefined);

export interface SliceCommandFieldsProviderProps {
    fieldsFor: SliceCommandFieldsSource;
    children?: ReactNode;
}

/**
 * Supplies the fields of a command to the task dialogs below it. The fields come from the command's metadata - Stage reads it
 * from the generated schemas, Studio from the model - so this package does not know where commands are defined.
 */
export function SliceCommandFieldsProvider({ fieldsFor, children }: SliceCommandFieldsProviderProps) {
    return <Context.Provider value={fieldsFor}>{children}</Context.Provider>;
}

/** The fields source in scope, or undefined when a host supplied none. */
export function useSliceCommandFields(): SliceCommandFieldsSource | undefined {
    return useContext(Context);
}
