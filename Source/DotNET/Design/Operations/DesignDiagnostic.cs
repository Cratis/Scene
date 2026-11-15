// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// A finding about an operation: why it was refused, or something its outcome leaves for the author to look at.
/// </summary>
/// <param name="Code">The code; a Scene engine finding is prefixed with <c language="text">scene.</c>.</param>
/// <param name="Severity">One of <c language="text">error</c>, <c language="text">warning</c> and <c language="text">info</c>.</param>
/// <param name="Message">What it says.</param>
/// <param name="Screen">The screen it concerns.</param>
/// <param name="Template">The template it concerns.</param>
/// <param name="Element">The element it concerns.</param>
/// <param name="Path">The property path it concerns.</param>
public record DesignDiagnostic(string Code, string Severity, string Message, string? Screen = null, string? Template = null, string? Element = null, string? Path = null);
