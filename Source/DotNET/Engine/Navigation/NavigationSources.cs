// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Where a region's items come from, as the region tag in design mode shows it.
/// </summary>
/// <param name="Kind">How the effective items relate to the application's.</param>
/// <param name="Label">The compact tag text: <c language="csharp">defined here</c>, <c language="csharp">inherited</c>, <c language="csharp">Application + Sales</c> or <c language="csharp">Sales only</c>.</param>
public record NavigationSources(NavigationSourcesKind Kind, string Label);
