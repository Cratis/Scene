// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Screens;

/// <summary>
/// A template that names a slot, where the set of containers in scope does not agree on exactly one home
/// for it.
/// </summary>
/// <param name="Template">The template that could not be placed.</param>
/// <param name="Slot">The slot name it declared it fits.</param>
/// <param name="Candidates">
/// The containers declaring a slot of that name. Empty when nothing declares it; more than one when the name
/// is ambiguous. Never exactly one - that case is a <see cref="ScreenTemplatePlacement"/> instead.
/// </param>
public record UnplacedScreenTemplate(string Template, string Slot, IReadOnlyList<string> Candidates);
