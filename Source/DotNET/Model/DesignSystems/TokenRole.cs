// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// What one design token is for. A token is addressed as <c language="csharp">&lt;category&gt;.&lt;name&gt;</c>, such as
/// <c language="csharp">color.primary</c> or <c language="csharp">space.md</c>; the description is the contract a theme author reads to choose a value.
/// </summary>
/// <param name="Category">The token's category: <c language="csharp">color</c>, <c language="csharp">space</c>, <c language="csharp">size</c>, <c language="csharp">radius</c>, <c language="csharp">border</c>, <c language="csharp">shadow</c>, <c language="csharp">font</c>, <c language="csharp">type</c>, <c language="csharp">motion</c>, <c language="csharp">opacity</c> or <c language="csharp">z</c>.</param>
/// <param name="Name">The token's name, unique within its category.</param>
/// <param name="Description">What the token is for, or <see langword="null"/> when it has none.</param>
public record TokenRole(string Category, string Name, string? Description = null);
