// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Exposure;

/// <summary>
/// What an instance may do to a collection a template exposed to it. Operations are granted one by one.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<CollectionOperation>))]
public enum CollectionOperation
{
    /// <summary>
    /// Add items of its own.
    /// </summary>
    [JsonStringEnumMemberName("add")]
    Add = 0,

    /// <summary>
    /// Remove items it added.
    /// </summary>
    [JsonStringEnumMemberName("remove")]
    Remove = 1,

    /// <summary>
    /// Change the order of items it added.
    /// </summary>
    [JsonStringEnumMemberName("reorder")]
    Reorder = 2,

    /// <summary>
    /// Change the fields of items it added.
    /// </summary>
    [JsonStringEnumMemberName("edit-fields")]
    EditFields = 3,

    /// <summary>
    /// Hide the items the owner, and every level above, put in the collection, so the instance's own items are all there is.
    /// The hidden items stay where they are and come back when the instance stops replacing.
    /// </summary>
    [JsonStringEnumMemberName("replace")]
    Replace = 4
}
