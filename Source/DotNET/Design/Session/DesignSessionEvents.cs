// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// The event types of a design session, by the name the TypeScript package gives them in its <c language="text">type</c> property.
/// </summary>
public static class DesignSessionEvents
{
    /// <summary>
    /// Gets the event types, by name.
    /// </summary>
    public static readonly IReadOnlyDictionary<string, Type> Types = new Dictionary<string, Type>(StringComparer.Ordinal)
    {
        [nameof(DesignSessionStarted)] = typeof(DesignSessionStarted),
        [nameof(DesignTemplateSetChanged)] = typeof(DesignTemplateSetChanged),
        [nameof(ScreenRevisionRecorded)] = typeof(ScreenRevisionRecorded),
        [nameof(ScreenRemovedFromDesign)] = typeof(ScreenRemovedFromDesign),
        [nameof(ScreensReordered)] = typeof(ScreensReordered),
        [nameof(ScreenReverted)] = typeof(ScreenReverted),
        [nameof(VariationsProposed)] = typeof(VariationsProposed),
        [nameof(VariationChosen)] = typeof(VariationChosen),
        [nameof(TweaksProposed)] = typeof(TweaksProposed),
        [nameof(TweakDismissed)] = typeof(TweakDismissed),
        [nameof(CommentAdded)] = typeof(CommentAdded),
        [nameof(CommentResolved)] = typeof(CommentResolved),
        [nameof(CommentPinned)] = typeof(CommentPinned),
        [nameof(CommentReopened)] = typeof(CommentReopened),
    };

    /// <summary>
    /// Reads an event from JSON that names its type in a <c language="text">type</c> property.
    /// </summary>
    /// <param name="element">The JSON.</param>
    /// <returns>The event.</returns>
    /// <exception cref="JsonException">The JSON names no design session event type.</exception>
    public static object Parse(JsonElement element)
    {
        var name = element.TryGetProperty("type", out var type) && type.ValueKind == JsonValueKind.String ? type.GetString()! : string.Empty;
        return Types.TryGetValue(name, out var eventType)
            ? element.Deserialize(eventType, DesignJson.Options)!
            : throw new JsonException($"'{name}' is not a design session event type.");
    }
}
