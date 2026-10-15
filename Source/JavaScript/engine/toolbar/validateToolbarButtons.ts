// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, SliceKind, Toolbar } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '../structure';
import { ToolbarDiagnostic } from './ToolbarDiagnostic';
import { ToolbarDiagnosticCode } from './ToolbarDiagnosticCode';
import { ToolbarDiagnosticSeverity } from './ToolbarDiagnosticSeverity';
import { normalizeToolbarButton } from './toolbarButtons';

/**
 * Validates the buttons of a toolbar against the application structure: a button must invoke a state change slice
 * (TB3), and a button without a slice is allowed but flagged (TB5). A hand-authored button that names a command is
 * converted first, and a button whose command no single slice accepts is a legacy button that still validates.
 *
 * The C# engine (`ToolbarButtonValidation.Validate`) reports the same codes, severities and messages in the same
 * order; both are asserted against `toolbar-slice-fixtures.json`.
 *
 * @param structure The modules, features and slices of the application.
 * @param toolbar The toolbar.
 * @returns The problems found, in button order.
 */
export function validateToolbarButtons(structure: ApplicationStructure | ApplicationStructureIndex, toolbar: Toolbar): ToolbarDiagnostic[] {
    const index = structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure);
    const diagnostics: ToolbarDiagnostic[] = [];

    for (const authored of toolbar.buttons) {
        const { button } = normalizeToolbarButton(index, authored);
        if (!button.slice) {
            if (!button.target) {
                diagnostics.push({
                    code: ToolbarDiagnosticCode.ToolbarButtonSliceEmpty,
                    severity: ToolbarDiagnosticSeverity.Warning,
                    message: `Toolbar button '${button.id}' has no slice to invoke.`,
                    button: button.id,
                });
            }

            continue;
        }

        const slice = index.findSlice(button.slice);
        if (!slice) {
            diagnostics.push({
                code: ToolbarDiagnosticCode.ToolbarButtonSliceNotFound,
                severity: ToolbarDiagnosticSeverity.Error,
                message: `Toolbar button '${button.id}' invokes slice '${button.slice}', which does not exist.`,
                button: button.id,
            });
        } else if (slice.kind !== SliceKind.StateChange) {
            diagnostics.push({
                code: ToolbarDiagnosticCode.ToolbarButtonSliceNotStateChange,
                severity: ToolbarDiagnosticSeverity.Error,
                message: `Toolbar button '${button.id}' invokes slice '${button.slice}', which is ${slice.kind === SliceKind.StateView ? 'a state view' : 'an automation'}; only a state change can be invoked from a toolbar.`,
                button: button.id,
            });
        }
    }

    return diagnostics;
}
