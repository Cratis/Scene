// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// The sources a host gathered.
/// </summary>
/// <param name="Sources">The sources.</param>
/// <param name="Missing">What could not be read, in words - a source the host looked for and did not find, or cannot read yet - so the model says in its summary what that leaves out.</param>
public record DesignSourceSet(IReadOnlyList<DesignSource> Sources, IReadOnlyList<string> Missing);
