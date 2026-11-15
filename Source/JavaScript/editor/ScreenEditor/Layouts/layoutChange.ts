// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode, SceneEditKind, type ChangeLayoutTypeEdit, type LayoutType, type SceneDiagnostic } from '@cratis/scene.model';

// A change of layout type, either ready to apply or waiting for the author to see what it would drop.
export type LayoutChangeStep =
    | { kind: 'applied' }
    | { kind: 'confirm'; lost: string; edit: ChangeLayoutTypeEdit }
    | { kind: 'refused'; diagnostics: SceneDiagnostic[] };

export const changeLayoutType = (elementNodeId: string, to: `${LayoutType}`, acceptLoss = false): ChangeLayoutTypeEdit =>
    ({ kind: SceneEditKind.ChangeLayoutType, nodeId: elementNodeId, to, ...(acceptLoss ? { acceptLoss: true } : {}) });

// Reads what Scene said about a layout-type change. A lossy conversion is refused until the author has seen what it
// would drop; this turns that refusal into a confirmation to show - and a repeat of the same edit that accepts the loss -
// rather than an error, so the author is asked instead of told no.
export function readLayoutChange(edit: ChangeLayoutTypeEdit, applied: boolean, diagnostics: readonly SceneDiagnostic[]): LayoutChangeStep {
    if (applied) return { kind: 'applied' };

    const lossy = diagnostics.find(diagnostic => diagnostic.code === DiagnosticCode.LossyConversionNotAccepted);
    return lossy
        ? { kind: 'confirm', lost: lossy.message, edit: { ...edit, acceptLoss: true } }
        : { kind: 'refused', diagnostics: [...diagnostics] };
}
