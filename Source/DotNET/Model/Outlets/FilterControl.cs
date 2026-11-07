// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// The control a filter shows. When a filter names none, the type of the query parameter it sets decides.
/// </summary>
public enum FilterControl
{
    /// <summary>A free-text search box.</summary>
    Search = 0,

    /// <summary>Choice chips, one per value.</summary>
    Choice = 1,

    /// <summary>A range between two values.</summary>
    Range = 2,

    /// <summary>A date or a date range.</summary>
    Date = 3,
}
