// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Engine.Profiles;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Design;

/// <summary>
/// The JSON options Scene Design reads and writes with: Scene's own, and a UI profile in the form <see cref="UiProfileJson"/> gives it.
/// </summary>
public static class DesignJson
{
    /// <summary>
    /// Gets the options. They are read-only; copy them to change them.
    /// </summary>
    public static JsonSerializerOptions Options { get; } = CreateOptions();

    static JsonSerializerOptions CreateOptions()
    {
        var options = new JsonSerializerOptions(SceneJson.Options);
        options.Converters.Insert(0, new UiProfileConverter());
        options.MakeReadOnly(populateMissingResolver: true);
        return options;
    }

    sealed class UiProfileConverter : JsonConverter<UiProfile>
    {
        public override UiProfile Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            using var document = JsonDocument.ParseValue(ref reader);
            return UiProfileJson.Parse(document.RootElement);
        }

        public override void Write(Utf8JsonWriter writer, UiProfile value, JsonSerializerOptions options)
        {
            using var document = JsonDocument.Parse(UiProfileJson.Serialize(value));
            document.RootElement.WriteTo(writer);
        }
    }
}
