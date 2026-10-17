// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Why a package cannot be removed, with a sentence for the lock's tooltip.
/// </summary>
/// <param name="Kind">What locks it.</param>
/// <param name="Packages">The packages that need it.</param>
/// <param name="Text">The sentence to show.</param>
public record PackageLock(
    PackageLockKind Kind,
    IReadOnlyList<string> Packages,
    string Text);
