// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// One of the values competing in a conflict.
/// </summary>
/// <param name="Value">The value, as the sources write it.</param>
/// <param name="Count">How many times the sources use it.</param>
/// <param name="Places">The files that use it most.</param>
public record ConflictOption(string Value, int Count, IReadOnlyList<ConflictPlace> Places);
