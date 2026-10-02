// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Model.Exposure;

/// <summary>
/// The value an instance - a screen, or a template nested in an owner's slot - set on a property that was exposed to it.
/// </summary>
/// <remarks>
/// Instance ids are <c language="csharp">screen:name</c>, <c language="csharp">template:name</c>,
/// <c language="csharp">dialog:name</c> and <c language="csharp">layout:name</c>.
/// </remarks>
/// <param name="Instance">The id of the instance that holds the value.</param>
/// <param name="Component">The id of the component the property is on.</param>
/// <param name="Path">The path of the property.</param>
/// <param name="Value">The value of a scalar property.</param>
/// <param name="Items">The items the instance added to a collection property.</param>
public record InstanceContribution(
    string Instance,
    string Component,
    string Path,
    JsonElement? Value = null,
    IReadOnlyList<ContributedItem>? Items = null);
