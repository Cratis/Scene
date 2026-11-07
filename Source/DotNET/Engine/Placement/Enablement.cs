// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Whether an action can be used, and why.
/// </summary>
/// <param name="State">Whether the action is enabled, disabled or hidden.</param>
/// <param name="Reason">Why: the reason of the check that decided it, or <c language="csharp">Enabled</c>.</param>
/// <param name="Steps">Every check made, in order.</param>
public record Enablement(EnablementState State, string Reason, IReadOnlyList<EnablementStep> Steps);
