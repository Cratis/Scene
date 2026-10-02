// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Exposure;

/// <summary>
/// What an instance may do to a collection a template exposed to it. Operations are granted one by one.
/// </summary>
public enum CollectionOperation
{
    /// <summary>
    /// Add items of its own.
    /// </summary>
    Add = 0,

    /// <summary>
    /// Remove items it added.
    /// </summary>
    Remove = 1,

    /// <summary>
    /// Change the order of items it added.
    /// </summary>
    Reorder = 2,

    /// <summary>
    /// Change the fields of items it added.
    /// </summary>
    EditFields = 3
}
