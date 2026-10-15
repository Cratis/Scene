// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '../renderer';
import { SliceDialogView } from './SliceDialogView';

/**
 * The `core:sliceDialog` component: the task dialog of a state change slice. Its `slice`, `command` and `title` properties are
 * optional - opened from a toolbar button the dialog's own parameters supply them - so one dialog template serves every slice.
 */
export function CoreSliceDialog({ element }: RegisteredComponentProps) {
    const text = (name: string) => typeof element.properties[name] === 'string' ? element.properties[name] as string : undefined;
    return <SliceDialogView slice={text('slice')} command={text('command')} title={text('title')} />;
}
