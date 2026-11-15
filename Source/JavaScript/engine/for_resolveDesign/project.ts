// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ResolvedDesign } from '../index';

/** What the shared corpus compares of a resolved design: the selection, the values, and every diagnostic by code. */
export function project(design: ResolvedDesign) {
    return JSON.parse(JSON.stringify({
        designSystem: design.designSystem,
        theme: design.theme,
        mode: design.mode,
        colorScheme: design.colorScheme,
        tokens: design.tokens,
        components: design.components,
        diagnostics: design.diagnostics,
        appearanceDiagnostics: design.appearance.diagnostics.map(diagnostic => diagnostic.code),
    }));
}
