// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// What a host is asked to gather the sources of a design system for.
/// </summary>
/// <param name="Scope">What the design system is for, in the host's own terms: Direct's product, Studio's project.</param>
/// <param name="Skipped">The kinds of source the person chose to leave out, by <see cref="DesignSourceKind"/> name.</param>
public record DesignSourcesRequest(string Scope, IReadOnlyCollection<string>? Skipped = null);
