// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A variant of a component, with the token role each of its parts takes and the parts each of its states overrides.
/// </summary>
/// <param name="Name">The variant's name (for example <c language="csharp">primary</c>).</param>
/// <param name="Parts">The token role (<c language="csharp">&lt;category&gt;.&lt;name&gt;</c>) of each part. The variant's own parts are the <c language="csharp">default</c> state.</param>
/// <param name="States">Per state (<c language="csharp">hover</c>, <c language="csharp">focus</c>, <c language="csharp">active</c>, <c language="csharp">disabled</c>, <c language="csharp">selected</c>), the token role of each part the state overrides; every other part keeps the variant's. <see langword="null"/> for a variant with no state.</param>
public record DesignVariant(
    string Name,
    IReadOnlyDictionary<string, string> Parts,
    IReadOnlyDictionary<string, IReadOnlyDictionary<string, string>>? States = null);
