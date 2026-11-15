// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// A slot of a screen template being authored.
/// </summary>
/// <param name="Name">The slot's name.</param>
/// <param name="Description">What it is for.</param>
/// <param name="Optional">Whether a screen may leave it empty.</param>
/// <param name="Primary">Whether it is the main content.</param>
/// <param name="Accepts">The semantic template types a screen must have to be placed in the slot.</param>
public record DesignSlot(string Name, string? Description = null, bool? Optional = null, bool? Primary = null, IReadOnlyList<string>? Accepts = null);
