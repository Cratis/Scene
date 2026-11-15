// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// Two or more values the sources use for what looks like the same purpose, for a person to settle.
/// </summary>
/// <param name="Id">The identity; the same competing values always have the same one, so finding them again changes nothing.</param>
/// <param name="Kind">What it is about.</param>
/// <param name="Title">What the choice is, in words.</param>
/// <param name="Options">The competing values, the most used first.</param>
public record DesignSystemConflict(string Id, DesignSystemConflictKind Kind, string Title, IReadOnlyList<ConflictOption> Options);
