// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// One thing a design does: add a screen, put a component in an outlet, set a property, link two screens, change the profile, ask for variations or
/// tweaks, or refuse. Operations are plain data; they are checked against the catalogue and lowered to Scene edits. A design operation names itself
/// in an <c language="text">op</c> property.
/// </summary>
[JsonConverter(typeof(DesignOperationConverter))]
public abstract record DesignOperation
{
    /// <summary>
    /// Gets the name the operation goes by in JSON.
    /// </summary>
    [JsonPropertyName("op")]
    public abstract string Op { get; }
}
