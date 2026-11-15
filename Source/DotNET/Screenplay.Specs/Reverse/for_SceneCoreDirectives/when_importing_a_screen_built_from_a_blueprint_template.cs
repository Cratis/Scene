// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

using Cratis.Scene.Screenplay.Reverse.given;
namespace Cratis.Scene.Screenplay.Reverse.for_SceneCoreDirectives;

// A screen filled from a blueprint template writes its title, data, table and summary inside the template's slots. They import as the core elements of the slot they
// fill, so the template's own seeded copy ('Deals', 'Nothing here yet') is replaced in the editor and the preview, not left showing (StudioIssues#895, #902).
public class when_importing_a_screen_built_from_a_blueprint_template : Specification
{
    const string Source =
        """
        module Warehouse
          feature Dispatch
            slice StateView Shipments
              readmodel ShipmentRow
                orderId Uuid
                sku String
              query AllShipments => observable ShipmentRow[]
              screen Shipments
                template blueprint Cratis.Blueprint.Default ListScreen version "^1"
                  header
                    title "Shipments"
                  list
                    data ShipmentRow[] via query AllShipments
                    table ShipmentRow
                      column orderId label "Order"
                      column sku label "SKU"
        """;

    JsonObject _screen = null!;

    void Because()
    {
        var imported = DocumentTransport.Import(Source);
        _screen = JsonNode.Parse(imported.CustomCode.Screens.Single().Document)!["screens"]![0]!.AsObject();
    }

    [Fact] void should_fill_the_header_slot_with_the_title() => _screen["slotContent"]!["header"]!.ToJsonString().ShouldContain("core:title");
    [Fact] void should_fill_the_list_slot_with_the_table() => _screen["slotContent"]!["list"]!.ToJsonString().ShouldContain("core:table");
    [Fact] void should_fill_the_list_slot_with_the_data_binding() => _screen["slotContent"]!["list"]!.ToJsonString().ShouldContain("core:data");
    [Fact] void should_still_name_the_template() => _screen["screenTemplate"]!.GetValue<string>().ShouldEqual("ListScreen");
}
