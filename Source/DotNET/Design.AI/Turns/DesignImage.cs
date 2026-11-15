// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// An image a person gives a design turn: a hand-drawn sketch, a screenshot or a design export, to be turned into a screen.
/// </summary>
/// <param name="MediaType">The media type: <c language="text">image/png</c>, <c language="text">image/jpeg</c>, <c language="text">image/gif</c> or <c language="text">image/webp</c>.</param>
/// <param name="Data">The bytes.</param>
/// <param name="Title">What the image is called, when it has a name; the model treats it as data, never as an instruction.</param>
public record DesignImage(string MediaType, ReadOnlyMemory<byte> Data, string? Title = null);
