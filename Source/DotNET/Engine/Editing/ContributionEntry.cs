// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// One instance contribution as stored: what it says typed, and the data it was read from. The contribution is null when the
/// data is not shaped like one.
/// </summary>
/// <param name="Instance">The id of the instance that holds the value.</param>
/// <param name="Component">The id of the component the property is on.</param>
/// <param name="Path">The path of the property.</param>
/// <param name="Raw">The data the contribution was read from.</param>
/// <param name="Contribution">The contribution, or <see langword="null"/> when the data is not shaped like one.</param>
sealed record ContributionEntry(string Instance, string Component, string Path, JsonElement Raw, InstanceContribution? Contribution)
{
    /// <summary>
    /// Gets what the contribution is about: the component and the path of its property.
    /// </summary>
    public (string Component, string Path) Key => (Component, Path);
}
