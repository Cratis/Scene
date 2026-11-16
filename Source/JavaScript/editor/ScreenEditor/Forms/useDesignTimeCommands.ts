// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo } from 'react';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import type { ScreenEditorEnvironment } from '../Host/ScreenEditorHost';

// Keeps the slices registered as commands for as long as the editor that uses them is open. They are registered while drawing as well as in the
// effect: a command form resolves its command when it is drawn, which is before an effect runs, and the effect puts them back after the strict-mode
// cleanup that would otherwise have removed them.
export function useDesignTimeCommands(slices: readonly StateChangeSlice[], registerDesignTimeCommands: ScreenEditorEnvironment['registerDesignTimeCommands']): void {
    useMemo(() => registerDesignTimeCommands?.(slices), [slices, registerDesignTimeCommands]);
    useEffect(() => registerDesignTimeCommands?.(slices), [slices, registerDesignTimeCommands]);
}
