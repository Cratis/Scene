// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// One exposure declaration as stored: what it says typed, and the data it was read from. The declaration is null when the
/// data is not shaped like one, which is still kept so it can be compared with what it replaced.
/// </summary>
/// <param name="Owner">The name of the layout or template that declares the exposure.</param>
/// <param name="Raw">The data the declaration was read from.</param>
/// <param name="Declaration">The declaration, or <see langword="null"/> when the data is not shaped like one.</param>
sealed record ExposureEntry(string Owner, JsonElement Raw, ExposureDeclaration? Declaration)
{
    /// <summary>
    /// A declaration that exposes nothing says no more than none at all, so the two are the same when documents are compared.
    /// </summary>
    /// <summary>
    /// Gets a value indicating whether the declaration exposes nothing.
    /// </summary>
    public bool IsEmpty => Declaration?.Properties is { Count: 0 };
}
