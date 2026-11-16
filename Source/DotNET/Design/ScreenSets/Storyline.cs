// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.ScreenSets;

/// <summary>
/// An ordered path through some of a set's screens: a story a user goes through.
/// </summary>
/// <param name="Name">Its name.</param>
/// <param name="Steps">The screens it goes through, in order.</param>
/// <param name="Title">What it is called.</param>
public record Storyline(string Name, IReadOnlyList<string> Steps, string? Title = null);
