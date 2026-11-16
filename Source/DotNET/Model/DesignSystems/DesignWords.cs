// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// How the product speaks. Words travel with the design system, so every theme speaks the same way.
/// </summary>
/// <param name="Voice">The tone of its text, as key and text pairs, or <see langword="null"/> for none.</param>
/// <param name="Naming">The terms the product uses instead of the model's own names (showing "Client" where the model says <c language="csharp">customer</c>), or <see langword="null"/> for none.</param>
public record DesignWords(
    IReadOnlyDictionary<string, string>? Voice = null,
    IReadOnlyDictionary<string, string>? Naming = null);
