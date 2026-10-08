// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// Where activating something takes the user.
/// </summary>
/// <param name="Screen">The legacy or explicit screen name to go to.</param>
/// <param name="Module">Stable module identity.</param>
/// <param name="Feature">Stable feature identity inside the module.</param>
/// <param name="Slice">Stable slice identity inside the feature.</param>
/// <param name="Outlet">The named outlet to replace.</param>
/// <param name="Route">The authored URL/path override.</param>
/// <param name="Kind">Whether this opens in an outlet, a dialog, or an external target.</param>
/// <param name="Dialog">A dialog template or dialog identity when <paramref name="Kind"/> is <see cref="DestinationKind.Dialog"/>.</param>
/// <param name="RouteParameterBindings">The values for route or screen parameters, keyed by parameter name.</param>
public record DestinationReference(
    string? Screen = null,
    string? Module = null,
    string? Feature = null,
    string? Slice = null,
    string? Outlet = null,
    string? Route = null,
    DestinationKind? Kind = null,
    string? Dialog = null,
    IReadOnlyDictionary<string, BindingExpression>? RouteParameterBindings = null);
