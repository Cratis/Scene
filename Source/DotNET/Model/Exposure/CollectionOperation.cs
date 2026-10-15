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
    EditFields = 3,

    /// <summary>
    /// Hide the items the owner, and every level above, put in the collection, so the instance's own items are all there is.
    /// The hidden items stay where they are and come back when the instance stops replacing.
    /// </summary>
    Replace = 4
}
