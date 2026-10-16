// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The slot of a layout or template that a screen fills.
/// </summary>
/// <param name="Owner">The layout or template that owns the slot.</param>
/// <param name="Slot">The slot's name.</param>
public record SlotUsage(string Owner, string Slot);
