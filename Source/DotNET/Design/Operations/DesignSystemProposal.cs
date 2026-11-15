// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// What the design system lacks that would let a request through: a token, a variant, a word or a component.
/// </summary>
/// <param name="Kind">One of <c language="text">token</c>, <c language="text">variant</c>, <c language="text">word</c> and <c language="text">component</c>.</param>
/// <param name="Summary">What it proposes.</param>
/// <param name="Address">The token address it concerns.</param>
/// <param name="Component">The component it concerns.</param>
/// <param name="Variant">The variant it concerns.</param>
/// <param name="Value">The value it concerns.</param>
public record DesignSystemProposal(string Kind, string Summary, string? Address = null, string? Component = null, string? Variant = null, string? Value = null);
