// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// Which sample data an application previews with: the active pack, the shape→read-model mapping table and
/// any per-read-model pack bindings. It is carried by the application's <see cref="Profiles.UiProfile"/>
/// (<c language="csharp">SampleData</c>), so the choice is made once for the whole application and inherited by every
/// screen, slice and component; it is never chosen per screen.
/// </summary>
/// <param name="Mappings">Explicit shape→read-model mappings, for where a pack's shape name is not the read model's name.</param>
/// <param name="Bindings">Per read model or shape pack bindings; each overrides the active pack for its target.</param>
/// <param name="ActivePack">The application's active pack identity. Null falls through to the blueprint's default pack, then generated data.</param>
public record SampleDataSelection(
    IReadOnlyList<SampleDataMapping> Mappings,
    IReadOnlyList<SampleDataBinding> Bindings,
    string? ActivePack = null);
