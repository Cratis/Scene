// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// Where one of the competing values is used.
/// </summary>
/// <param name="Source">The file, as <c language="text">origin: name</c>.</param>
/// <param name="Count">How many times the file uses the value.</param>
public record ConflictPlace(string Source, int Count);
