// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Model.for_Arrangement;

/// <summary>
/// Both <see cref="Layouts.Arrangement"/> and <see cref="Layouts.FlowNode"/> are abstract, so a reference typed
/// as either one - a layout's own arrangement, a screen template's own arrangement, a
/// <see cref="FlowContainer.Children"/> entry - has to actually carry its concrete shape into JSON rather
/// than collapsing to `{}`. That collapse is exactly what shipped without <c language="csharp">[JsonPolymorphic]</c> on
/// either base: every layout and screen template arrangement served over `/stage/scene` read back empty,
/// which a renderer cannot tell apart from "no arrangement declared" - Cratis/Stage's own arrangement
/// engine had nothing to evaluate no matter how carefully a `.play` file modeled one.
/// </summary>
public class when_serializing_a_flow_arrangement : Specification
{
    /// <summary>
    /// Mirrors Cratis.Stage's own serializer options - a bare <see cref="JsonSerializerDefaults.Web"/> serializes
    /// an enum as its underlying number, which <see cref="FlowContainerKind"/> never does once ASP.NET Core's
    /// JSON options add a string converter, so this spec would otherwise assert against a shape nothing in
    /// production sends.
    /// </summary>
    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    Arrangement _arrangement = null!;
    JsonElement _json;

    void Establish() =>
        _arrangement = new FlowArrangement(
            new FlowRow
            {
                Gap = 8,
                Children =
                [
                    new FlowSlotLeaf("body") { Grow = 1 },
                    new FlowSlotLeaf("aside"),
                ],
            });

    void Because() => _json = JsonSerializer.SerializeToElement(_arrangement, _options);

    [Fact] void should_include_the_concrete_arrangement_shape() => _json.TryGetProperty("root", out _).ShouldBeTrue();
    [Fact] void should_serialize_the_root_as_its_concrete_flow_node_kind() => _json.GetProperty("root").GetProperty("kind").GetString().ShouldEqual("Row");
    [Fact] void should_serialize_children_polymorphically_rather_than_as_the_flow_node_base() =>
        _json.GetProperty("root").GetProperty("children")[0].GetProperty("slotName").GetString().ShouldEqual("body");
    [Fact] void should_carry_grow_through_a_slot_leaf() =>
        _json.GetProperty("root").GetProperty("children")[0].GetProperty("grow").GetDouble().ShouldEqual(1);
}
