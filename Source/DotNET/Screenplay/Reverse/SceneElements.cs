// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Scene elements to typed Screenplay components. An external component keeps its package and name, its exact id as the
/// stable id and every property as a literal or a binding; a panel travels as a 'panel' component whose layout members are
/// its properties and whose children are its 'children' slot.
/// </summary>
internal static partial class SceneElements
{
    const string NameProperty = "name";

    static readonly string[] _componentMembers = [.. SceneElementFrame.ElementMembers, "componentName", "slots", "context", "icon", "presentation", "exposes"];

    [GeneratedRegex(@"^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*:[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$", RegexOptions.None, 1000)]
    private static partial Regex ComponentNameRegex { get; }

    [GeneratedRegex(@"^[\w.]+$", RegexOptions.None, 1000)]
    private static partial Regex PropertyNameRegex { get; }

    public static IReadOnlyList<ScreenDirectiveSyntax> ToDirectives(JsonNode? elements, SceneElementScope scope) =>
        [.. (elements as JsonArray ?? []).Select(element => ToDirective(element, scope)).OfType<ScreenDirectiveSyntax>()];

    static ScreenDirectiveSyntax? ToDirective(JsonNode? node, SceneElementScope scope)
    {
        if (node is not JsonObject element || SceneJson.String(element, "id") is not { Length: > 0 } id)
        {
            scope.Gaps.Add("Scene element without an id cannot travel as typed Screenplay.");
            return null;
        }

        var owner = $"element '{id}'";
        SceneElementFrame.Check(element, owner, scope.Gaps);
        if (element["componentName"] is not null)
        {
            if (SceneCoreDirectives.TryToDirective(element) is { } core)
            {
                return core;
            }

            if (Component(element, id, owner, scope) is not { } component)
            {
                return null;
            }

            return ActionShorthand(component) is { } action ? action : component;
        }

        if (element[SceneElementFrame.PanelChildren] is JsonArray)
        {
            return Panel(element, id, owner, scope);
        }

        scope.Gaps.Add($"Scene element '{id}' is neither a component nor a panel and cannot travel as typed Screenplay.");
        return null;
    }

    /// <summary>
    /// A core action that is only the command it runs and the label it shows, under the name of its command, is the `action &lt;command&gt;`
    /// line Screenplay has for it, and what an `action` line imports as (SceneElementImport.Action), so it travels as that line.
    /// </summary>
    static ScreenActionSyntax? ActionShorthand(ScreenComponentSyntax component)
    {
        if (component.Component != "core.action" || component.StableId != component.Name || component.Slots.Any() || component.Behaviors.Any() ||
            component.Context is not null || component.Icon is not null || component.Presentation.Any() || component.Exposes.Any())
        {
            return null;
        }

        string? command = null;
        string? label = null;
        foreach (var property in component.Properties)
        {
            // An action without a label imports with a null one, which travels as a null literal.
            if (property is not { Binding: null, Value: LiteralExpressionSyntax { Value: string or null } literal })
            {
                return null;
            }

            var text = literal.Value as string;
            switch (property.Property)
            {
                case "command" when text == component.Name:
                    command = text;
                    break;
                case "label":
                    label = text;
                    break;
                default:
                    return null;
            }
        }

        return command is null ? null : new ScreenActionSyntax(command, label, null, SourceLocation.Start);
    }

    static ScreenComponentSyntax? Component(JsonObject element, string id, string owner, SceneElementScope scope)
    {
        scope.Gaps.UnknownMembers(element, owner, _componentMembers);
        var componentName = SceneJson.String(element, "componentName");
        if (componentName is null || !ComponentNameRegex.IsMatch(componentName))
        {
            scope.Gaps.Member(owner, "componentName", $"'{componentName}' is not a 'package:component' name Screenplay {ScreenplayVersion.Current} can carry");
            return null;
        }

        List<ComponentPropertySyntax> properties = [];
        foreach (var (name, value) in SceneJson.Object(element, "properties") ?? [])
        {
            if (Property(name, value, owner, scope.Gaps) is { } property)
            {
                properties.Add(property);
            }
        }

        var slots = (SceneJson.Object(element, "slots") ?? [])
            .Select(slot => new ComponentSlotSyntax(slot.Key, SceneNative.Weave(SceneElements.ToDirectives(slot.Value, scope), SceneNative.Of(element, slot.Key), scope), SourceLocation.Start));

        return Named(element, id, ScreenplayComponentName(componentName), properties, scope) with
        {
            Context = SceneJson.Object(element, "context") is { } context ? SceneValues.ToBinding(context, owner + " context", scope.Gaps) : null,
            Icon = Icon(element, owner, scope.Gaps),
            Presentation = [.. Presentation(element, owner, scope.Gaps)],
            Exposes = [.. Exposes(element, owner, scope.Gaps)],
            Slots = [.. slots]
        };
    }

    static ScreenDirectiveSyntax Panel(JsonObject element, string id, string owner, SceneElementScope scope)
    {
        if (!SceneJson.IsEmpty(element["properties"]))
        {
            scope.Gaps.Member(owner, "properties", "a panel travels with its layout members as its properties, so it cannot carry properties of its own");
        }

        var known = SceneElementFrame.ElementMembers.Append(SceneElementFrame.PanelChildren).ToHashSet(StringComparer.Ordinal);
        List<ComponentPropertySyntax> properties = [];
        foreach (var (name, value) in element.Where(member => !known.Contains(member.Key)))
        {
            if (!PropertyNameRegex.IsMatch(name) || name == NameProperty)
            {
                scope.Gaps.Member(owner, name, $"it is not a property name Screenplay {ScreenplayVersion.Current} can write");
                continue;
            }

            properties.Add(new(name, null, SceneValues.ToExpression(value), SourceLocation.Start));
        }

        var children = new ComponentSlotSyntax(SceneElementFrame.PanelChildren, SceneNative.Weave(ToDirectives(element[SceneElementFrame.PanelChildren], scope), SceneNative.Of(element, SceneElementFrame.PanelChildren), scope), SourceLocation.Start);
        var panel = Named(element, id, SceneElementFrame.PanelComponent, properties, scope) with { Slots = [children] };

        // A panel that is only its children is the section Screenplay has for it, which needs no component package.
        return !panel.Properties.Any() && panel.Name == id
            ? new ScreenSectionSyntax(panel.Name, [.. panel.Behaviors.Select(behavior => (ScreenDirectiveSyntax)new ScreenBehaviorSyntax(behavior, SourceLocation.Start)), .. children.Directives], SourceLocation.Start)
            : panel;
    }

    /// <summary>
    /// The component's Screenplay name is its id made an identifier and unique on the screen; when that is not the element's
    /// exact name, the exact name travels as the 'name' property the stage plan reports it under.
    /// </summary>
    static ScreenComponentSyntax Named(JsonObject element, string id, string component, List<ComponentPropertySyntax> properties, SceneElementScope scope)
    {
        var elementName = SceneJson.String(element, NameProperty);
        var name = scope.UniqueName(id);
        if (elementName is not null && elementName != name)
        {
            properties.Insert(0, new(NameProperty, null, new LiteralExpressionSyntax(elementName, SourceLocation.Start), SourceLocation.Start));
        }

        return new(component, name, SourceLocation.Start)
        {
            StableId = id,
            Properties = [.. properties],
            Behaviors = SceneBehaviors.ToSyntax(element["behaviors"], $"element '{id}'", scope.Names, scope.Gaps)
        };
    }

    static ComponentPropertySyntax? Property(string name, JsonNode? value, string owner, SceneTransportGaps gaps)
    {
        if (!PropertyNameRegex.IsMatch(name) || name == NameProperty)
        {
            gaps.Member(owner, "properties." + name, name == NameProperty
                ? "the element's own name travels as the 'name' property"
                : $"it is not a property name Screenplay {ScreenplayVersion.Current} can write");
            return null;
        }

        return SceneValues.IsBinding(value)
            ? new(name, SceneValues.ToBinding((JsonObject)value!, $"{owner} property '{name}'", gaps), null, SourceLocation.Start)
            : new(name, null, SceneValues.ToExpression(value), SourceLocation.Start);
    }

    static string? Icon(JsonObject element, string owner, SceneTransportGaps gaps)
    {
        if (element["icon"] is null)
        {
            return null;
        }

        if (SceneJson.String(element, "icon") is { } icon && icon.Trim() == icon && icon.Length > 0)
        {
            return icon;
        }

        gaps.Member(owner, "icon", $"Screenplay {ScreenplayVersion.Current} carries an icon as a single line of text");
        return null;
    }

    static IEnumerable<PresentationValueSyntax> Presentation(JsonObject element, string owner, SceneTransportGaps gaps)
    {
        foreach (var (name, value) in SceneJson.Object(element, "presentation") ?? [])
        {
            if (SceneJson.IsIdentifier(name) && value is JsonValue text && text.TryGetValue<string>(out var presentation))
            {
                yield return new(name, presentation, SourceLocation.Start);
                continue;
            }

            gaps.Member(owner, "presentation." + name, $"Screenplay {ScreenplayVersion.Current} carries presentation values as named text");
        }
    }

    static IEnumerable<ComponentExposedValueSyntax> Exposes(JsonObject element, string owner, SceneTransportGaps gaps)
    {
        foreach (var (name, value) in SceneJson.Object(element, "exposes") ?? [])
        {
            if (SceneJson.IsIdentifier(name) && SceneValues.IsBinding(value))
            {
                yield return new(name, SceneValues.ToBinding((JsonObject)value!, $"{owner} exposed value '{name}'", gaps), SourceLocation.Start);
                continue;
            }

            gaps.Member(owner, "exposes." + name, $"Screenplay {ScreenplayVersion.Current} exposes a named binding");
        }
    }

    /// <summary>
    /// A Scene component is named 'package:component', where the component may itself be dotted ('scene:web.DataGrid') and so
    /// may the package ('Cratis.Components:commandForm'). Screenplay names the same component 'package.component'
    /// ('scene.web.DataGrid', 'Cratis.Components.commandForm'), and the import splits it back at the package the name begins
    /// with (SceneElementImport), so only the package separator changes.
    /// </summary>
    static string ScreenplayComponentName(string componentName) => componentName.Replace(':', '.');
}
