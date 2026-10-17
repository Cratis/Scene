// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// Which values of a pack's status column belong to which <see cref="SampleStatus"/>. A value in none of the lists is neutral.
/// </summary>
/// <param name="Good">The values that are good.</param>
/// <param name="Pending">The values that are pending.</param>
/// <param name="Bad">The values that are bad.</param>
/// <param name="Neutral">The values that are neutral.</param>
public record SampleStatusClassification(
    IReadOnlyList<string>? Good = null,
    IReadOnlyList<string>? Pending = null,
    IReadOnlyList<string>? Bad = null,
    IReadOnlyList<string>? Neutral = null);
