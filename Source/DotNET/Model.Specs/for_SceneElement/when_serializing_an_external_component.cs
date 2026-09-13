// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Elements;

namespace Cratis.Scene.Model.for_SceneElement;

public class when_serializing_an_external_component : Specification
{
    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web);

    SceneElement _element = null!;
    JsonElement _json;

    void Establish()
    {
        _element = new ExternalComponent
        {
            Id = "section",
            Name = "section",
            ComponentName = "core:section",
            Slots = new Dictionary<string, IReadOnlyList<SceneElement>>
            {
                ["content"] =
                [
                    new ExternalComponent
                    {
                        Id = "title",
                        Name = "title",
                        ComponentName = "core:title",
                        Properties = new Dictionary<string, object?> { ["text"] = "Invoices" },
                    },
                ],
            },
        };
    }

    void Because() => _json = JsonSerializer.SerializeToElement(_element, _options);

    [Fact] void should_include_the_concrete_component_name() => _json.GetProperty("componentName").GetString().ShouldEqual("core:section");
    [Fact] void should_include_the_framework_element_name() => _json.GetProperty("name").GetString().ShouldEqual("section");
    [Fact] void should_serialize_nested_scene_elements_polymorphically() =>
        _json.GetProperty("slots").GetProperty("content")[0].GetProperty("componentName").GetString().ShouldEqual("core:title");
}
