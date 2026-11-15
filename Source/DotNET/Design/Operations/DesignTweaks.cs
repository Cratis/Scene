// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Scene.Design.Catalogue;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Resolves tweak controls against a design and lowers them to operations. The TypeScript twin is <c language="text">tweaks</c>.
/// </summary>
public static partial class DesignTweaks
{
    /// <summary>
    /// Resolves a control; a control bound to nothing the design has, or to something that is not a choice, resolves to null.
    /// </summary>
    /// <param name="control">The control.</param>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <returns>The result.</returns>
    public static ResolvedTweak? Resolve(TweakControl control, DesignWorkspace workspace, DesignContext context)
    {
        var address = control.Address;
        if (address.Kind == "profile")
        {
            if (address.Key is null || workspace.Profile is null || !DesignProfileKeys.All.Contains(address.Key))
            {
                return null;
            }

            if (control.Kind == "hue")
            {
                return address.Key == DesignProfileKeys.Accent ? new ResolvedTweak(control, [], workspace.Profile.Appearance?.Accent ?? string.Empty) : null;
            }

            var allowed = DesignProfileOperations.KeyValues(context.Catalogue, address.Key);
            return allowed is null || allowed.Count == 0
                ? null
                : new ResolvedTweak(control, Subset(control.Options, allowed), DesignProfileOperations.Value(workspace.Profile, address.Key));
        }

        if (address.Kind == "token")
        {
            var token = context.Catalogue.Tokens.FirstOrDefault(candidate => candidate.Address == address.Token);
            return token is null ? null : new ResolvedTweak(control, [], token.Values.Count > 0 ? token.Values[0].Value : string.Empty);
        }

        var target = DocumentLookup.ResolveTarget(workspace.Document, address.Screen, address.Template);
        var place = target is null || address.Element is null ? null : DocumentLookup.FindElement(target, address.Element);
        if (place is null || address.Prop is null)
        {
            return null;
        }

        var component = DesignCatalogueLookup.FindComponent(context.Catalogue, DocumentLookup.ComponentNameOf(place.Element));
        var property = component?.Properties.FirstOrDefault(candidate => candidate.Name == address.Prop);
        if (property is null || property.Kind != DesignValueKind.Choice || property.Choices is null)
        {
            return null;
        }

        var current = (place.Element["properties"] as JsonObject)?[address.Prop];
        return new ResolvedTweak(control, Subset(control.Options, [.. property.Choices.Select(JsText.Of)]), current is null ? string.Empty : Text(current));
    }

    /// <summary>
    /// Resolves the controls of a design, dropping those that resolve to nothing.
    /// </summary>
    /// <param name="controls">The controls.</param>
    /// <param name="workspace">The workspace.</param>
    /// <param name="context">The context.</param>
    /// <returns>The result.</returns>
    public static IReadOnlyList<ResolvedTweak> ResolveAll(IEnumerable<TweakControl> controls, DesignWorkspace workspace, DesignContext context) =>
        [.. controls.Select(control => Resolve(control, workspace, context)).OfType<ResolvedTweak>()];

    /// <summary>
    /// Lowers moving a control to a value. A profile key and a property of an element become operations a design applies; a token is the design   system's, so it becomes a proposal for the design-system draft.
    /// </summary>
    /// <param name="control">The control.</param>
    /// <param name="value">The value.</param>
    /// <returns>The result.</returns>
    public static LoweredTweak Lower(TweakControl control, string value)
    {
        var address = control.Address;
        if (address.Kind == "profile" && address.Key is not null)
        {
            return new LoweredTweak([new ProfileOperation(address.Key, value)], []);
        }

        if (address.Kind == "token")
        {
            return new LoweredTweak([], [DesignProfileOperations.TokenProposal(value) with { Address = address.Token }]);
        }

        var typed = value.Length > 0 && Numeric().IsMatch(value) && double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var number)
            ? JsonSerializer.SerializeToElement(number)
            : JsonSerializer.SerializeToElement(value);
        var operation = address.Screen is null
            ? new SetOperation(address.Element ?? string.Empty, address.Prop ?? string.Empty, typed, null, address.Template)
            : new SetOperation(address.Element ?? string.Empty, address.Prop ?? string.Empty, typed, address.Screen);
        return new LoweredTweak([operation], []);
    }

    [GeneratedRegex(@"^-?\d", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Numeric();

    static string Text(JsonNode node) => node is JsonValue value && value.TryGetValue<string>(out var text)
        ? text
        : node is JsonValue number && number.TryGetValue<double>(out var parsed) ? JsText.Number(parsed) : node.ToJsonString();

    static List<string> Subset(IReadOnlyList<string>? wanted, IReadOnlyList<string> allowed)
    {
        var kept = wanted is null ? [.. allowed] : wanted.Where(allowed.Contains).ToList();
        return kept.Count > 0 ? kept : [.. allowed];
    }
}
