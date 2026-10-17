// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// Where a screen template sits in the shell: the outermost template of its chain and the outlet that template fits.
/// </summary>
/// <param name="Template">The name of the outermost template of the chain - the one whose <c language="csharp">FitsSlot</c> names the outlet.</param>
/// <param name="Outlet">The outlet of the shell it fits (a name the shell may not have).</param>
/// <param name="Qualifier">The qualifier of its <c language="csharp">FitsSlot</c> (<c language="csharp">Shell.outlet</c>), when it has one.</param>
public record TemplatePlacement(string Template, string Outlet, string? Qualifier = null);
