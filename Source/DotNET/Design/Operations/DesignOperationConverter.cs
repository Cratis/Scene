// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Reads and writes design operations by their <c language="text">op</c> property. An operation that names nothing a design knows is read as an
/// <see cref="UnknownDesignOperation"/>, so that it can be refused with a reason instead of failing to read.
/// </summary>
public class DesignOperationConverter : JsonConverter<DesignOperation>
{
    static readonly Dictionary<string, Type> _types = new(StringComparer.Ordinal)
    {
        ["addScreen"] = typeof(AddScreenOperation),
        ["removeScreen"] = typeof(RemoveScreenOperation),
        ["moveScreen"] = typeof(MoveScreenOperation),
        ["addTemplate"] = typeof(AddTemplateOperation),
        ["addSlot"] = typeof(AddSlotOperation),
        ["removeSlot"] = typeof(RemoveSlotOperation),
        ["arrange"] = typeof(ArrangeOperation),
        ["insert"] = typeof(InsertOperation),
        ["set"] = typeof(SetOperation),
        ["remove"] = typeof(RemoveOperation),
        ["move"] = typeof(MoveOperation),
        ["link"] = typeof(LinkOperation),
        ["profile"] = typeof(ProfileOperation),
        ["variations"] = typeof(VariationsOperation),
        ["tweaks"] = typeof(TweaksOperation),
        ["refuse"] = typeof(RefuseOperation),
    };

    /// <inheritdoc/>
    public override DesignOperation? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        using var document = JsonDocument.ParseValue(ref reader);
        var element = document.RootElement;
        var name = element.ValueKind == JsonValueKind.Object && element.TryGetProperty("op", out var op) && op.ValueKind == JsonValueKind.String ? op.GetString()! : string.Empty;
        return _types.TryGetValue(name, out var type)
            ? (DesignOperation?)element.Deserialize(type, options)
            : new UnknownDesignOperation(name);
    }

    /// <inheritdoc/>
    public override void Write(Utf8JsonWriter writer, DesignOperation value, JsonSerializerOptions options) =>
        JsonSerializer.Serialize(writer, value, value.GetType(), options);
}
