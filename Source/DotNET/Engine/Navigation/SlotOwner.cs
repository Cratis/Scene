// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// A slot together with the layout or screen template that declares it.
/// </summary>
/// <param name="Slot">The declared slot.</param>
/// <param name="Owner">The name of the declaring layout or screen template.</param>
/// <param name="OwnedByLayout">Whether the owner is a layout rather than a screen template.</param>
sealed record SlotOwner(Slot Slot, string Owner, bool OwnedByLayout);
