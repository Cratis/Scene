// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// A reference to a value already resolved by whatever produced this model (Stage translating Screenplay,
/// or Studio's editor) — Scene never re-runs name resolution, it only carries the resolved path forward.
/// </summary>
/// <param name="Path">The resolved path to the bound value.</param>
public record BindingExpression(string Path);
