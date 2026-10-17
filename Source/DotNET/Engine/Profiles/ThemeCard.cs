// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One theme a designer offers as a card.
/// </summary>
/// <param name="Name">The theme's name.</param>
/// <param name="Scheme">The theme's scheme, <c language="csharp">light</c> or <c language="csharp">dark</c>.</param>
/// <param name="Accent">The accent the card's bar is drawn in.</param>
/// <param name="Corners">The corner radius in words (<c language="csharp">8px corners</c>).</param>
/// <param name="Description">What the theme looks like.</param>
/// <param name="Selected">Whether it is the profile's theme.</param>
/// <param name="Available">Whether choosing the theme needs nothing more.</param>
/// <param name="Package">The package choosing the theme would add.</param>
/// <param name="Reason">Why the theme is not available, ready to show.</param>
public record ThemeCard(string Name, string Scheme, string? Accent, string? Corners, string? Description, bool Selected, bool Available, string? Package, string? Reason);
