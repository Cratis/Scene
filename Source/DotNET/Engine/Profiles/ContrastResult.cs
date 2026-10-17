// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The contrast of a colour against white.
/// </summary>
/// <param name="Valid">Whether the colour could be read.</param>
/// <param name="Ratio">The contrast ratio, rounded to two decimals; <see langword="null"/> when the colour is not valid.</param>
/// <param name="Grade">The grade of the ratio.</param>
/// <param name="Message">Why the colour is not valid.</param>
public record ContrastResult(bool Valid, double? Ratio = null, ContrastGrade? Grade = null, string? Message = null);
