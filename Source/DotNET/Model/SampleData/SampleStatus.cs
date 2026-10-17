// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// How a pill for a status value is coloured.
/// </summary>
public enum SampleStatus
{
    /// <summary>
    /// A positive state: active, delivered, approved.
    /// </summary>
    Good = 0,

    /// <summary>
    /// A state that is in progress or waiting.
    /// </summary>
    Pending = 1,

    /// <summary>
    /// A negative state: rejected, overdue, out of stock.
    /// </summary>
    Bad = 2,

    /// <summary>
    /// Anything else; the class of every value the pack does not name.
    /// </summary>
    Neutral = 3
}
