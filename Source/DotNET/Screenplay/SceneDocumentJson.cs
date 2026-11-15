// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Screenplay;

/// <summary>
/// The JSON options a Scene document is read and written with by the Screenplay bridge.
/// </summary>
/// <remarks>
/// Property names are camel-cased and read case-insensitively, nulls are omitted, and an enumeration is written in camel case
/// except the ones Scene documents have always written in Pascal case (see <see cref="PascalCasedEnumerations"/>).
/// </remarks>
public static class SceneDocumentJson
{
    /// <summary>
    /// Gets the names of the enumerations a Scene document writes in Pascal case.
    /// </summary>
    public static readonly IReadOnlySet<string> PascalCasedEnumerations = new HashSet<string>(StringComparer.Ordinal)
    {
        "ColorScheme",
        "CornerStyle",
        "Dock",
        "FlowContainerKind",
        "GridUnitType",
        "GuardOperator",
        "GuardedActionFallbackOutcome",
        "HeightSizeClass",
        "HorizontalAlignment",
        "InteractionActionKind",
        "InteractionTriggerKind",
        "LogicalGuardOperator",
        "LogoKind",
        "NotificationLevel",
        "Orientation",
        "PackageKind",
        "SliceKind",
        "TargetSizeClass",
        "TemplateReferenceSource",
        "TemplateRole",
        "TemplateScope",
        "VerticalAlignment",
        "Visibility",
        "WidthSizeClass",
    };

    /// <summary>
    /// Gets the options to serialize and deserialize a Scene document with.
    /// </summary>
    public static JsonSerializerOptions Options { get; } = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new EnumerationNaming() },
    };

    sealed class EnumerationNaming : JsonConverterFactory
    {
        public override bool CanConvert(Type typeToConvert) => typeToConvert.IsEnum;

        public override JsonConverter? CreateConverter(Type typeToConvert, JsonSerializerOptions options) =>
            new JsonStringEnumConverter(PascalCasedEnumerations.Contains(typeToConvert.Name) ? null : JsonNamingPolicy.CamelCase).CreateConverter(typeToConvert, options);
    }
}
