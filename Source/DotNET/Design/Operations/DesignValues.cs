// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Scene.Design.Catalogue;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Checks the properties and values of a component against the catalogue: a design uses what the component declares and what the design system offers,
/// never free styling or a value of its own. The TypeScript twin is <c language="text">designValues</c>.
/// </summary>
internal static partial class DesignValues
{
    /// <summary>
    /// Determines whether a property name is free styling rather than a setting of a component.
    /// </summary>
    /// <param name="name)">The name).</param>
    /// <returns>The result.</returns>
    public static bool IsFreeStylingProperty(string name) => FreeStyling().IsMatch(name);

    /// <summary>
    /// Determines whether a free styling property name stands for a colour, which a design system answers with a token.
    /// </summary>
    /// <param name="name)">The name).</param>
    /// <returns>The result.</returns>
    public static bool IsColourProperty(string name) => Colour().IsMatch(name);

    /// <summary>
    /// Whether a value is a style of its own - a hex colour, a CSS function, markup - rather than something the design system offers.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>The result.</returns>
    public static bool IsOffSystemLiteral(JsonElement value) =>
        value.ValueKind == JsonValueKind.String && IsOffSystemLiteral(value.GetString()!);

    /// <summary>
    /// Gets is off system literal.
    /// </summary>
    /// <param name="value)">The value).</param>
    /// <returns>The result.</returns>
    public static bool IsOffSystemLiteral(string value) => HexColour().IsMatch(value) || CssFunction().IsMatch(value) || Markup().IsMatch(value);

    /// <summary>
    /// Checks a property of a component and the value it is given: it must exist, take the value, and not be free styling or a value of its own.
    /// </summary>
    /// <param name="component">The component.</param>
    /// <param name="name">The name.</param>
    /// <param name="value">The value.</param>
    /// <param name="catalogue">The catalogue.</param>
    /// <returns>The result.</returns>
    public static DesignRefusal? CheckProperty(DesignComponentEntry component, string name, JsonElement value, DesignCatalogue catalogue)
    {
        var property = component.Properties.FirstOrDefault(candidate => candidate.Name == name);
        if (property is null)
        {
            return IsFreeStylingProperty(name)
                ? DesignRefusal.Of(DesignRefusalCode.FreeStylingNotAllowed, DesignMessages.FreeStyling(name))
                : DesignRefusal.Of(DesignRefusalCode.PropertyUnknown, DesignMessages.PropertyUnknown(component.Label, name, component.Properties.Select(candidate => candidate.Name)));
        }

        return CheckValue(component, property, value, catalogue);
    }

    /// <summary>
    /// Gets what a property takes in a Scene document: a destination named by a bare screen name becomes a destination reference.
    /// </summary>
    /// <param name="component">The component.</param>
    /// <param name="name">The name.</param>
    /// <param name="value">The value.</param>
    /// <returns>The result.</returns>
    public static JsonNode? ToSceneValue(DesignComponentEntry component, string name, JsonElement value)
    {
        var property = component.Properties.FirstOrDefault(candidate => candidate.Name == name);
        return property?.Kind == DesignValueKind.Destination && value.ValueKind == JsonValueKind.String
            ? new JsonObject { ["screen"] = value.GetString() }
            : Node(value);
    }

    /// <summary>
    /// Gets node.
    /// </summary>
    /// <param name="value">The value.</param>
    /// <returns>The result.</returns>
    public static JsonNode? Node(JsonElement value) =>
        value.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null ? null : JsonNode.Parse(value.GetRawText());

    [GeneratedRegex("^(background|backgroundColor|foreground|color|colour|border|borderColor|borderThickness|borderRadius|padding|margin|fontSize|fontFamily|fontWeight|shadow|boxShadow|gradient|opacity|style|className|css|html|width|height|zIndex)$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 1000)]
    private static partial Regex FreeStyling();

    [GeneratedRegex("^(background|backgroundColor|foreground|color|colour|border|borderColor|gradient|shadow|boxShadow)$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Colour();

    [GeneratedRegex(@"^\s*#[0-9a-f]{3,8}\s*$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 1000)]
    private static partial Regex HexColour();

    [GeneratedRegex(@"\b(rgb|rgba|hsl|hsla|linear-gradient|radial-gradient|url)\(", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 1000)]
    private static partial Regex CssFunction();

    [GeneratedRegex(@"</?[a-z][^>]*>", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture | RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Markup();

    static bool IsPlainNumber(JsonElement value) => value.ValueKind == JsonValueKind.Number;

    static DesignRefusal NotAllowed(string prop, string expected) => DesignRefusal.Of(DesignRefusalCode.ValueNotAllowed, DesignMessages.ValueNotAllowed(prop, expected));

    static DesignRefusal? CheckValue(DesignComponentEntry component, DesignPropertyEntry property, JsonElement value, DesignCatalogue catalogue)
    {
        if (value.ValueKind is JsonValueKind.Undefined or JsonValueKind.Null)
        {
            return null;
        }

        if (value.ValueKind == JsonValueKind.String && IsOffSystemLiteral(value.GetString()!))
        {
            return DesignRefusal.Of(DesignRefusalCode.OffSystemValue, DesignMessages.OffSystem(value.GetString()!));
        }

        switch (property.Kind)
        {
            case DesignValueKind.Text:
            case DesignValueKind.Icon:
                return value.ValueKind == JsonValueKind.String ? null : NotAllowed(property.Name, "takes text");
            case DesignValueKind.Number:
                if (!IsPlainNumber(value))
                {
                    return NotAllowed(property.Name, "takes a number");
                }

                var number = value.GetDouble();
                if (property.Minimum is { } minimum && number < minimum)
                {
                    return NotAllowed(property.Name, $"is at least {JsText.Number(minimum)}");
                }

                return property.Maximum is { } maximum && number > maximum ? NotAllowed(property.Name, $"is at most {JsText.Number(maximum)}") : null;

            case DesignValueKind.Boolean:
                return value.ValueKind is JsonValueKind.True or JsonValueKind.False ? null : NotAllowed(property.Name, "takes true or false");
            case DesignValueKind.Choice:
                return CheckChoice(component, property, value);
            case DesignValueKind.Query:
                if (value.ValueKind != JsonValueKind.String || value.GetString()!.Length == 0)
                {
                    return NotAllowed(property.Name, "takes the name of a query");
                }

                var name = value.GetString()!;
                return catalogue.Queries.Count > 0 && !catalogue.Queries.Any(query => query.Name == name || query.Id == name)
                    ? DesignRefusal.Of(DesignRefusalCode.QueryUnknown, DesignMessages.QueryUnknown(name, catalogue.Queries.Select(query => query.Name)))
                    : null;

            case DesignValueKind.Destination:
                var named = value.ValueKind == JsonValueKind.String
                    ? value.GetString()
                    : value.ValueKind == JsonValueKind.Object && value.TryGetProperty("screen", out var screen) && screen.ValueKind == JsonValueKind.String ? screen.GetString() : null;
                return string.IsNullOrEmpty(named) ? NotAllowed(property.Name, "takes a screen to navigate to") : null;

            default:
                return null;
        }
    }

    static DesignRefusal? CheckChoice(DesignComponentEntry component, DesignPropertyEntry property, JsonElement value)
    {
        var choices = property.Choices;
        var plain = value.ValueKind is JsonValueKind.String or JsonValueKind.Number;
        if (choices is null)
        {
            return plain ? null : NotAllowed(property.Name, "takes one of its choices");
        }

        var texts = choices.Select(JsText.Of).ToList();
        if (!plain)
        {
            return NotAllowed(property.Name, $"takes one of: {string.Join(", ", texts)}");
        }

        if (texts.Contains(JsText.Of(value)))
        {
            return null;
        }

        var governed = component.Anatomy?.DesignSystemComponent is not null && component.Anatomy.VariantProperty == property.Name;
        return governed
            ? DesignRefusal.Of(DesignRefusalCode.VariantNotInDesignSystem, DesignMessages.VariantNotInDesignSystem(component.Label, JsText.Of(value), texts))
            : NotAllowed(property.Name, $"takes one of: {string.Join(", ", texts)}");
    }
}
