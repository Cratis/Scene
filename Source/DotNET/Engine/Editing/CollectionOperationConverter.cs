// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Reads and writes a <see cref="CollectionOperation"/> as the name a Scene document stores it under:
/// <c language="csharp">add</c>, <c language="csharp">remove</c>, <c language="csharp">reorder</c> or
/// <c language="csharp">edit-fields</c>.
/// </summary>
sealed class CollectionOperationConverter : JsonConverter<CollectionOperation>
{
    static readonly (string Name, CollectionOperation Operation)[] _names =
    [
        ("add", CollectionOperation.Add),
        ("remove", CollectionOperation.Remove),
        ("reorder", CollectionOperation.Reorder),
        ("edit-fields", CollectionOperation.EditFields)
    ];

    /// <inheritdoc/>
    public override CollectionOperation Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var name = reader.GetString();
        foreach (var (candidate, operation) in _names)
        {
            if (candidate == name)
            {
                return operation;
            }
        }

        throw new JsonException($"'{name}' is not a collection operation.");
    }

    /// <inheritdoc/>
    public override void Write(Utf8JsonWriter writer, CollectionOperation value, JsonSerializerOptions options) =>
        writer.WriteStringValue(_names.First(entry => entry.Operation == value).Name);
}
