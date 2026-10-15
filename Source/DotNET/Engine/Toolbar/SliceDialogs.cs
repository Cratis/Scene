// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Structure;
using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// Works out the task dialog a state change slice opens, once, so no host decides it again (TB4).
/// </summary>
/// <remarks>
/// The TypeScript engine (<c language="csharp">sliceDialogFor</c>) resolves the same dialog; both are asserted against <c language="csharp">toolbar-slice-fixtures.json</c>.
/// </remarks>
public static class SliceDialogs
{
    /// <summary>
    /// The dialog template used when a slice names none.
    /// </summary>
    public const string DefaultTemplate = "FormDialog";

    /// <summary>
    /// Resolves the dialog of a slice.
    /// </summary>
    /// <param name="index">The modules, features and slices of the application.</param>
    /// <param name="sliceId">The slice's qualified id.</param>
    /// <param name="defaultTemplate">The template used when the slice names none; <see cref="DefaultTemplate"/> when <see langword="null"/>.</param>
    /// <returns>The dialog, or <see langword="null"/> when there is no such slice or it is not a state change.</returns>
    public static SliceDialog? For(ApplicationStructureIndex index, string sliceId, string? defaultTemplate = null)
    {
        var slice = index.FindSlice(sliceId);
        if (slice is not { Kind: SliceKind.StateChange })
        {
            return null;
        }

        var command = slice.Command ?? slice.Id;
        return string.IsNullOrEmpty(slice.DialogTemplate)
            ? new SliceDialog(sliceId, command, defaultTemplate ?? DefaultTemplate, SliceDialogSource.Default)
            : new SliceDialog(sliceId, command, slice.DialogTemplate, SliceDialogSource.Slice);
    }
}
