// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Engine.Screens;

/// <summary>
/// The containing layout or screen template against which a fitsSlot selection is checked.
/// </summary>
/// <param name="Name">The containing definition's name.</param>
/// <param name="Slots">The slots declared by the containing definition.</param>
public record TemplateContainer(string Name, IReadOnlyList<Slot> Slots);
