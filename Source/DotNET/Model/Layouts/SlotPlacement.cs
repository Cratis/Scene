// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// The absolute position and size of one of a <see cref="Layout"/>'s own named <see cref="Slot"/>s within a
/// <see cref="FreeformSlotVariant"/> - the counterpart to <see cref="ElementPlacement"/>, which places an
/// element within a single slot's own content instead of placing a slot within the layout.
/// </summary>
/// <param name="SlotName">The name of the <see cref="Slot"/> being placed.</param>
/// <param name="X">The horizontal offset.</param>
/// <param name="Y">The vertical offset.</param>
/// <param name="Width">The width.</param>
/// <param name="Height">The height.</param>
public record SlotPlacement(string SlotName, double X, double Y, double Width, double Height);
