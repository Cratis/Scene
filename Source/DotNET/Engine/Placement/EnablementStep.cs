// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// One check enablement made, and why it turned out as it did.
/// </summary>
/// <param name="Check">What was checked.</param>
/// <param name="Outcome">How it turned out.</param>
/// <param name="Reason">Why, such as <c language="csharp">It is for item, so it waits for a selection</c>.</param>
public record EnablementStep(EnablementCheck Check, EnablementOutcome Outcome, string Reason);
