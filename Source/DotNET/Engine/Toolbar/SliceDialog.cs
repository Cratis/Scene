// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Toolbar;

/// <summary>
/// The task dialog a state change slice opens: its command and the dialog template that shows the command's fields as a form.
/// </summary>
/// <param name="Slice">The qualified id of the slice.</param>
/// <param name="Command">The command the dialog submits.</param>
/// <param name="Template">The dialog template.</param>
/// <param name="Source">Whether the slice named the template or the default was used.</param>
public record SliceDialog(string Slice, string Command, string Template, SliceDialogSource Source);
