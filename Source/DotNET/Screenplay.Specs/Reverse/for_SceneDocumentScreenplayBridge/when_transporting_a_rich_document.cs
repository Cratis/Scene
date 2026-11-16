// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

public class when_transporting_a_rich_document : given.a_rich_scene_document
{
    void Because() => Transport((Guid.NewGuid().ToString(), "Admin", RichDocument));

    [Fact] void should_have_no_export_warnings() => _warnings.ShouldBeEmpty();
    [Fact] void should_not_use_the_preservation_carrier() => _source.ShouldNotContain(ScreenplaySceneDocumentReferences.Prefix);
    [Fact] void should_not_write_a_studio_scene_id_side_channel() => _source.ShouldNotContain("studioSceneId");
    [Fact] void should_write_the_exact_stable_id() => _source.ShouldContain("id \"orders-title\"");
    [Fact] void should_plan_the_screen_under_the_role_name() => _plan.Screens.Select(screen => screen.Name).ShouldContainOnly("Admin");
    [Fact] void should_plan_every_component_under_its_exact_id() =>
        PlannedElements("Admin").Select(element => element.Id).ShouldContain(["screen-root", "orders-title", "orders-table", "number-column", "status-column"]);
    [Fact] void should_plan_a_string_literal() => Property("orders-title", "text").ShouldEqual(JsonValue.Create("Orders \"today\"").ToJsonString());
    [Fact] void should_plan_a_whole_number_literal() => Property("orders-title", "level").ShouldEqual("2");
    [Fact] void should_plan_a_fractional_number_literal() => Property("orders-title", "ratio").ShouldEqual("0.5");
    [Fact] void should_plan_a_boolean_literal() => Property("orders-title", "visible").ShouldEqual("true");
    [Fact] void should_plan_a_null_literal() => Property("orders-title", "subtitle").ShouldEqual("null");
    [Fact] void should_write_an_array_as_an_indented_block() => LineAfter("property tags").TrimStart().StartsWith("item ", StringComparison.Ordinal).ShouldBeTrue();
    [Fact] void should_write_an_object_as_an_indented_block() => LineAfter("property options").ShouldContain(" = ");
    [Fact] void should_write_no_json() => _source.ShouldNotContain(" = [");
    [Fact] void should_reopen_the_array_literal() => ReopenedProperty("tags").ShouldEqual("[\"urgent\",3,false,null,[1.5]]");
    [Fact] void should_reopen_the_object_literal() => ReopenedProperty("options").ShouldEqual("{\"dense\":true,\"size\":{\"width\":3,\"unit\":\"rem\"}}");
    [Fact] void should_plan_the_exact_element_name() => Property("orders-table", "name").ShouldEqual("\"Order list\"");
    [Fact] void should_plan_a_literal_binding() => Binding("label").Kind.ShouldEqual(BindingSourceKind.Literal);
    [Fact] void should_plan_the_literal_binding_value() => JsonSerializer.Serialize(Binding("label").Value).ShouldEqual("\"Hello\"");
    [Fact] void should_plan_a_query_binding() => Binding("count").Query.ShouldEqual("AllOrders");
    [Fact] void should_plan_the_binding_null_behavior() => Binding("count").NullBehavior.ShouldEqual(BindingNullBehavior.Clear);
    [Fact] void should_plan_a_component_property_binding() => Binding("mirror").ComponentId.ShouldEqual("orders-table");
    [Fact] void should_plan_the_component_behavior() => Action("orders-title").Kind.ShouldEqual(InteractionActionKind.ExecuteCommand);
    [Fact] void should_plan_the_behavior_arguments() => Action("orders-title").Arguments.Single().Name.ShouldEqual("orderId");
    [Fact] void should_plan_the_success_outcome() => Action("orders-title").OnSuccess.Single().Kind.ShouldEqual(InteractionActionKind.Notify);
    [Fact] void should_plan_the_failure_outcomes() => Action("orders-title").OnFailure.Count.ShouldEqual(2);
    [Fact] void should_plan_every_table_behavior() => PlannedElement("Admin", "orders-table").Behaviors.Count.ShouldEqual(4);
    [Fact] void should_plan_the_screen_behavior() => PlannedScreen("Admin").Behaviors.ShouldNotBeEmpty();
    [Fact] void should_plan_the_manual_generation_mode() => Form("OrderForm").GenerationMode.ToString().ShouldEqual("Manual");
    [Fact] void should_plan_the_layout_columns() => Form("OrderForm").Layout!.Columns.Count.ShouldEqual(2);
    [Fact] void should_plan_the_column_widths() => Form("OrderForm").Layout!.Columns[0].MaxWidth!.Value.ShouldEqual(50.5);
    [Fact] void should_plan_an_automatic_column_width() => Form("OrderForm").Layout!.Columns[1].Width!.Unit.ToString().ShouldEqual("Auto");
    [Fact] void should_plan_the_layout_placements() => Form("OrderForm").Layout!.Placements.Single(placement => placement.Field == "orderId").ColumnSpan.ShouldEqual(2);
    [Fact] void should_plan_the_column_gap() => Form("OrderForm").Layout!.ColumnGap!.Value.ShouldEqual(8d);
    [Fact] void should_plan_the_row_gap() => Form("OrderForm").Layout!.RowGap!.Value.ShouldEqual(4d);

    // Stage 4.216 plans a form's submit behavior as a typed continuation of the submitted command (Stage#175), no longer as a generic behavior.
    [Fact] void should_plan_the_form_submit_continuation() => Form("OrderForm").OnSubmit.Single().Kind.ShouldEqual(InteractionActionKind.ExecuteCommand);
    [Fact] void should_plan_a_field_placed_on_its_own() => Form("NoteForm").Layout!.Placements.Single().Width!.Value.ShouldEqual(100d);
    [Fact] void should_reopen_one_document_for_the_role() => _import.CustomCode.Screens.Count.ShouldEqual(1);
    [Fact] void should_reopen_the_role_by_name() => Reopened("Admin").ActorId.ShouldBeNull();
    [Fact] void should_reopen_a_document_saying_the_same_as_the_source() => FirstDifference(RichDocument, Reopened("Admin").Document).ShouldBeNull();
    [Fact] void should_reopen_the_field_placement_on_the_field() =>
        JsonNode.Parse(Reopened("Admin").Document)!["screens"]![0]!["forms"]![1]!["fields"]![0]!["placement"]!["width"]!["value"]!.GetValue<double>().ShouldEqual(100d);

    string Property(string element, string property) => JsonSerializer.Serialize(PlannedElement("Admin", element).Properties[property]);

    BindingExpression Binding(string property) => (BindingExpression)PlannedElement("Admin", "orders-title").Properties[property]!;

    InteractionAction Action(string element) => PlannedElement("Admin", element).Behaviors.Single().Bindings.Single().Actions.Single();

    string ReopenedProperty(string property) =>
        JsonNode.Parse(Reopened("Admin").Document)!["screens"]![0]!["slotContent"]!["content"]![0]!["children"]![0]!["properties"]![property]!.ToJsonString();

    Cratis.Scene.Model.Forms.Form Form(string name) => PlannedScreen("Admin").Forms.Single(form => form.Name == name);

    string LineAfter(string header)
    {
        var lines = _source.Split('\n');
        return lines[Array.FindIndex(lines, line => line.TrimEnd().EndsWith(header, StringComparison.Ordinal)) + 1];
    }
}
