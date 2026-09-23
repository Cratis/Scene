// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Interactions;

/// <summary>
/// Changes the active screen.
/// </summary>
/// <param name="Screen">The screen to navigate to.</param>
/// <remarks>
/// The screen is named, never addressed. Turning a screen reference into a URL is a renderer's job, so this
/// model stays meaningful to a renderer that has no URLs at all.
/// </remarks>
public record NavigateAction(string Screen) : InteractionAction;
