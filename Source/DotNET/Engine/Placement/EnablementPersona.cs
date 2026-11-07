// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Placement;

/// <summary>
/// The persona an action is shown to, as far as authorization is concerned.
/// </summary>
/// <param name="Name">The persona's name, such as <c language="csharp">Catalog manager</c>.</param>
/// <param name="Policies">The policies the persona satisfies.</param>
public record EnablementPersona(string Name, IReadOnlyList<string> Policies);
