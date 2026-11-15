// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.ScreenSets;

/// <summary>
/// One place a screen navigates to another: an element's destination property.
/// </summary>
/// <param name="From">The screen that navigates.</param>
/// <param name="Element">The element that navigates.</param>
/// <param name="Prop">The property that holds the destination.</param>
/// <param name="To">The screen it navigates to.</param>
public record ScreenLink(string From, string Element, string Prop, string To);
