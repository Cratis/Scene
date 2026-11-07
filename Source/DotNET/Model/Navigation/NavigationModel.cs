// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// All the navigation an application declares: the outlets of its shell layout and how each module refines them.
/// </summary>
/// <param name="Application">The application-level navigation.</param>
/// <param name="Modules">The per-module navigation; a module that is not listed inherits everything.</param>
public record NavigationModel(ApplicationNavigation Application, IReadOnlyList<ModuleNavigation> Modules);
