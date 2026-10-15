// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// The edits an edit helper decided on, or why it refused.
/// </summary>
/// <param name="Edits">The edits to apply, in order; empty when the helper refused or nothing needs to change.</param>
/// <param name="Rejected">Why the gesture is refused; <see langword="null"/> when it is allowed.</param>
public record NavigationEditPlan(IReadOnlyList<NavigationEdit> Edits, string? Rejected = null);
