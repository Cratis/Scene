// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// Whether an action can run its slice directly, without a form, and why.
/// </summary>
/// <param name="Available">Whether every input has a source.</param>
/// <param name="Missing">The inputs with no source, in the command's order.</param>
/// <param name="Reason">Why, such as <c language="csharp">price has no source, so it needs the form</c>.</param>
public record RunDirectly(bool Available, IReadOnlyList<string> Missing, string Reason);
