// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// An outlet together with the layout or screen template that declares it.
/// </summary>
/// <param name="Outlet">The declared outlet.</param>
/// <param name="Owner">The name of the declaring layout or screen template.</param>
/// <param name="OwnedByLayout">Whether the owner is a layout rather than a screen template.</param>
sealed record OutletOwner(Outlet Outlet, string Owner, bool OwnedByLayout);
