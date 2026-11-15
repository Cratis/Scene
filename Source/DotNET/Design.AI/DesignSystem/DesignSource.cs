// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem;

/// <summary>
/// One source a design system is established from.
/// </summary>
/// <param name="Kind">What the source is.</param>
/// <param name="Origin">Where it comes from, as a person would say it: a repository, <c language="text">uploaded brand file</c>, <c language="text">the running app</c>.</param>
/// <param name="Name">Its name: a path, a file name, the screen and mode of a capture.</param>
/// <param name="Content">Its text; empty for a capture.</param>
/// <param name="Image">A capture's image; <see langword="null"/> for a source that is text.</param>
/// <param name="MediaType">The media type of a capture: <c language="text">image/png</c>, <c language="text">image/jpeg</c>, <c language="text">image/gif</c> or <c language="text">image/webp</c>.</param>
public record DesignSource(DesignSourceKind Kind, string Origin, string Name, string Content = "", ReadOnlyMemory<byte>? Image = null, string MediaType = "");
