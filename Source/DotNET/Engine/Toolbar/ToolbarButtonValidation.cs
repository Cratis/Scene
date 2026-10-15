// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// Validates the buttons of a toolbar against the application structure: a button must invoke a state change slice (TB3), and a
/// button without a slice is allowed but flagged (TB5). A hand-authored button that names a command is converted first, and a button
/// whose command no single slice accepts is a legacy button that still validates.
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">validateToolbarButtons</c>) reports the same codes, severities and messages in the same order; both are
/// asserted against <c language="csharp">toolbar-slice-fixtures.json</c>.
/// </remarks>
public static class ToolbarButtonValidation
{
    /// <summary>
    /// Validates the buttons.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="toolbar">The toolbar.</param>
    /// <returns>The problems found, in button order.</returns>
    public static IReadOnlyList<ToolbarDiagnostic> Validate(ApplicationStructureIndex index, Model.Toolbar.Toolbar toolbar)
    {
        var diagnostics = new List<ToolbarDiagnostic>();
        foreach (var authored in toolbar.Buttons)
        {
            var (button, _) = ToolbarButtons.Normalize(index, authored);
            if (string.IsNullOrEmpty(button.Slice))
            {
                if (string.IsNullOrEmpty(button.Target))
                {
                    diagnostics.Add(new(ToolbarDiagnosticCode.ToolbarButtonSliceEmpty, ToolbarDiagnosticSeverity.Warning, $"Toolbar button '{button.Id}' has no slice to invoke.", button.Id));
                }

                continue;
            }

            var slice = index.FindSlice(button.Slice);
            if (slice is null)
            {
                diagnostics.Add(new(ToolbarDiagnosticCode.ToolbarButtonSliceNotFound, ToolbarDiagnosticSeverity.Error, $"Toolbar button '{button.Id}' invokes slice '{button.Slice}', which does not exist.", button.Id));
            }
            else if (slice.Kind != SliceKind.StateChange)
            {
                var kind = slice.Kind == SliceKind.StateView ? "a state view" : "an automation";
                diagnostics.Add(new(
                    ToolbarDiagnosticCode.ToolbarButtonSliceNotStateChange,
                    ToolbarDiagnosticSeverity.Error,
                    $"Toolbar button '{button.Id}' invokes slice '{button.Slice}', which is {kind}; only a state change can be invoked from a toolbar.",
                    button.Id));
            }
        }

        return diagnostics;
    }
}
