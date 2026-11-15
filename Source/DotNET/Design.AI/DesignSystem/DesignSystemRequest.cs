// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// What a person asked of the design system.
/// </summary>
/// <param name="Scope">What the design system is for, in the host's terms; passed to <see cref="IDesignSources"/>.</param>
/// <param name="Current">The Screenplay of the draft as it is - the <c language="text">design system</c> and its <c language="text">theme</c>s; empty when there is none yet.</param>
/// <param name="Brief">What the person asked for, or notes about the brand from the team.</param>
/// <param name="Steps">The steps to take, by <see cref="DesignSystemPhases"/>. Empty: establishing from nothing when there is no <paramref name="Current"/>, otherwise revising it as asked.</param>
/// <param name="Skipped">The kinds of source to leave out, by <see cref="DesignSourceKind"/> name.</param>
public record DesignSystemRequest(
    string Scope,
    string Current = "",
    string Brief = "",
    IReadOnlyList<string>? Steps = null,
    IReadOnlyCollection<string>? Skipped = null);
