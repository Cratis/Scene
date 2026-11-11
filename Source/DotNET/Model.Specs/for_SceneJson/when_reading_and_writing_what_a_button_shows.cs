// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Model.for_SceneJson;

public class when_reading_and_writing_what_a_button_shows : Specification
{
    /// <summary>
    /// Buttons as TypeScript writes them: one showing only its icon, one only its title, and one that says nothing.
    /// </summary>
    const string Written = """[{"kind":"button","id":"create","title":"New work item","icon":"add","display":"icon"},{"kind":"button","id":"print","title":"Print","display":"title"},{"kind":"button","id":"ship","title":"Ship"}]""";

    IReadOnlyList<OutletItem> _items = null!;
    JsonArray _written = null!;

    void Because()
    {
        _items = JsonSerializer.Deserialize<List<OutletItem>>(Written, SceneJson.Options);
        _written = JsonNode.Parse(JsonSerializer.Serialize(_items, SceneJson.Options)).AsArray();
    }

    [Fact] void should_read_a_button_that_shows_only_its_icon() => ((OutletButton)_items[0]).Display.ShouldEqual(OutletButtonDisplay.Icon);
    [Fact] void should_read_a_button_that_shows_only_its_title() => ((OutletButton)_items[1]).Display.ShouldEqual(OutletButtonDisplay.Title);
    [Fact] void should_read_a_button_that_says_nothing_as_showing_the_default() => ((OutletButton)_items[2]).Display.ShouldBeNull();
    [Fact] void should_write_what_it_shows_as_typescript_reads_it() => _written[0]["display"].GetValue<string>().ShouldEqual("icon");
    [Fact]
    void should_write_both_as_typescript_reads_it() =>
        JsonSerializer.Serialize(OutletButtonDisplay.IconAndTitle, SceneJson.Options).ShouldEqual("\"iconAndTitle\"");
}
