// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// Typed Screenplay screen directives back to the Scene elements the editor opens.
/// </summary>
static class SceneElementImport
{
    const string NameProperty = "name";

    /// <summary>
    /// The packages whose names are dotted, so a Screenplay component name 'Cratis.Components.commandForm' is the component
    /// 'commandForm' of 'Cratis.Components' and not the component 'Components.commandForm' of 'Cratis'. Any other name splits at
    /// its first dot.
    /// </summary>
    static readonly string[] _dottedPackages = ["Cratis.Blueprint.Components", "Cratis.Blueprint.Default", "Cratis.Components"];

    public static JsonArray ToElements(IEnumerable<ScreenDirectiveSyntax> directives, SceneScreenNames names) =>
        [.. directives.Select(directive => ToElement(directive, names)).OfType<JsonNode>()];

    public static IEnumerable<BehaviorSyntax> Behaviors(IEnumerable<ScreenDirectiveSyntax> directives) =>
        directives.OfType<ScreenBehaviorSyntax>().Select(directive => directive.Behavior);

    internal static JsonObject Base(string id, string name, IEnumerable<BehaviorSyntax> behaviors, SceneScreenNames names)
    {
        var element = new JsonObject { ["id"] = id, ["name"] = name };
        foreach (var (member, value) in SceneElementFrame.Defaults())
        {
            element[member] = value?.DeepClone();
        }

        element["properties"] = new JsonObject();
        var json = SceneBehaviors.ToJson(behaviors, names);
        if (json.Count > 0)
        {
            element["behaviors"] = json;
        }

        return element;
    }

    static JsonObject? ToElement(ScreenDirectiveSyntax directive, SceneScreenNames names) => directive switch
    {
        ScreenComponentSyntax { Component: SceneElementFrame.PanelComponent } panel => Panel(panel, names),
        ScreenComponentSyntax component => Component(component, names),
        ScreenSectionSyntax section => Section(section, names),
        ScreenActionSyntax action => Action(action),
        _ when SceneCoreDirectives.IsElement(directive) => SceneCoreDirectives.ToElement(directive, names),
        _ => null
    };

    static JsonObject Component(ScreenComponentSyntax component, SceneScreenNames names)
    {
        var properties = new JsonObject();
        foreach (var property in component.Properties.Where(property => !IsElementName(property)))
        {
            properties[property.Property] = property.Binding is { } binding ? SceneValues.ToJson(binding) : SceneValues.ToJson(property.Value);
        }

        var element = Element(component, names);
        element["componentName"] = SceneComponentName(component.Component);
        element["properties"] = properties;
        element["slots"] = new JsonObject(component.Slots.Select(slot => KeyValuePair.Create(slot.Name, (JsonNode?)ToElements(slot.Directives, names))));
        foreach (var slot in component.Slots)
        {
            SceneNative.Attach(element, slot.Name, SceneNative.Capture(slot.Directives));
        }

        if (component.Context is { } context)
        {
            element["context"] = SceneValues.ToJson(context);
        }

        SceneValues.Optional(element, "icon", component.Icon);
        if (component.Presentation.Any())
        {
            element["presentation"] = new JsonObject(component.Presentation.Select(value => KeyValuePair.Create(value.Name, (JsonNode?)value.Value)));
        }

        if (component.Exposes.Any())
        {
            element["exposes"] = new JsonObject(component.Exposes.Select(value => KeyValuePair.Create(value.Name, (JsonNode?)SceneValues.ToJson(value.Binding))));
        }

        return element;
    }

    static JsonObject Panel(ScreenComponentSyntax panel, SceneScreenNames names)
    {
        var element = Element(panel, names);
        foreach (var property in panel.Properties.Where(property => !IsElementName(property)))
        {
            element[property.Property] = property.Binding is { } binding ? SceneValues.ToJson(binding) : SceneValues.ToJson(property.Value);
        }

        var children = panel.Slots.Where(slot => slot.Name == SceneElementFrame.PanelChildren).SelectMany(slot => slot.Directives).ToArray();
        element[SceneElementFrame.PanelChildren] = ToElements(children, names);
        SceneNative.Attach(element, SceneElementFrame.PanelChildren, SceneNative.Capture(children));
        return element;
    }

    static JsonObject Section(ScreenSectionSyntax section, SceneScreenNames names)
    {
        var element = Base(section.Name, section.Name, Behaviors(section.Directives), names);
        element[SceneElementFrame.PanelChildren] = ToElements(section.Directives, names);
        SceneNative.Attach(element, SceneElementFrame.PanelChildren, SceneNative.Capture(section.Directives));
        return element;
    }

    static JsonObject Action(ScreenActionSyntax action)
    {
        var element = Base(action.Command, action.Command, [], new SceneScreenNames(string.Empty, []));
        element["componentName"] = "core:action";
        element["properties"] = new JsonObject { ["command"] = action.Command, ["label"] = action.Label };
        element["slots"] = new JsonObject();
        return element;
    }

    static JsonObject Element(ScreenComponentSyntax component, SceneScreenNames names)
    {
        var name = component.Properties.FirstOrDefault(IsElementName)?.Value is LiteralExpressionSyntax { Value: string exact } ? exact : component.Name;
        return Base(component.StableId ?? component.Name, name, component.Behaviors, names);
    }

    static bool IsElementName(ComponentPropertySyntax property) =>
        property.Property == NameProperty && property.Binding is null && property.Value is LiteralExpressionSyntax { Value: string };

    static string SceneComponentName(string component)
    {
        var dotted = _dottedPackages.FirstOrDefault(package => component.StartsWith(package + '.', StringComparison.Ordinal));
        if (dotted is not null)
        {
            return $"{dotted}:{component[(dotted.Length + 1)..]}";
        }

        var separator = component.IndexOf('.', StringComparison.Ordinal);
        return separator < 0 ? component : $"{component[..separator]}:{component[(separator + 1)..]}";
    }
}
