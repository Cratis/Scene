// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

// A screen's title, data binding, table and summary are Scene's own core components (core:title, core:data, core:table with core:column
// children, core:summary with core:field children). Written as typed elements they export as the directives Screenplay has for them,
// and the directives import as those elements again: an imported screen shows its content on the canvas instead of an empty page
// (StudioIssues#902) and exports what it imported.
public class when_transporting_the_content_directives_of_a_screen : given.a_scene_document_transport
{
    const string Frame = """
        "visibility":"Visible","isEnabled":true,"opacity":1,"size":{},"zIndex":0,"minimumSize":{},"maximumSize":{},
        "margin":{"left":0,"top":0,"right":0,"bottom":0},"horizontalAlignment":"Stretch","verticalAlignment":"Stretch"
        """;

    static string Document => $$$"""
        {
          "layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],
          "screenTemplates":[],"dialogTemplates":[],
          "screens":[{
            "name":"Screen","layout":"StudioScreen",
            "slotContent":{"content":[
              {"id":"title","name":"Orders","componentName":"core:title",{{{Frame}}},"properties":{"text":"Orders"},"slots":{}},
              {"id":"data-orders","name":"Data Orders","componentName":"core:data",{{{Frame}}},"properties":{"typeName":"Orders","isCollection":true,"query":"AllOrders","by":null},"slots":{}},
              {"id":"table-orders","name":"Table Orders","componentName":"core:table",{{{Frame}}},"properties":{"typeName":"Orders"},"slots":{"columns":[
                {"id":"table-orders-column-number","name":"Order","componentName":"core:column",{{{Frame}}},"properties":{"property":"number","label":"Order"},"slots":{}}
              ]}},
              {"id":"summary-orders","name":"Summary Orders","componentName":"core:summary",{{{Frame}}},"properties":{"typeName":"Orders"},"slots":{"fields":[
                {"id":"summary-orders-field-number","name":"Order","componentName":"core:field",{{{Frame}}},"properties":{"property":"number","label":"Order"},"slots":{}}
              ]}},
              {"id":"details-title","name":"Details","componentName":"core:title",{{{Frame}}},"properties":{"text":"Details"},"slots":{}},
              {"id":"loud","name":"loud","componentName":"core:title",{{{Frame}}},"properties":{"text":"Loud","level":1},"slots":{}}
            ]},
            "forms":[],"contributions":[]
          }],
          "exposures":[],"instanceContributions":[]
        }
        """;

    string _reopened = string.Empty;

    void Because()
    {
        Transport((Guid.NewGuid().ToString(), "Admin", Document));
        _reopened = _import.CustomCode.Screens.Single().Document;
    }

    [Fact] void should_write_the_title_directive() => _source.ShouldContain("title \"Orders\"");
    [Fact] void should_write_the_data_directive() => _source.ShouldContain("data Orders[] via query AllOrders");
    [Fact] void should_write_the_table_directive_with_its_column() => _source.ShouldContain("column number label \"Order\"");
    [Fact] void should_write_the_summary_directive_with_its_field() => _source.ShouldContain("field number label \"Order\"");
    [Fact] void should_keep_a_title_that_says_more_in_the_long_form() => _source.ShouldContain("component core.title loud");
    [Fact] void should_keep_a_title_with_an_id_of_its_own_in_the_long_form() => _source.ShouldContain("component core.title detailstitle");
    [Fact] void should_reopen_the_title_as_a_core_element() => _reopened.ShouldContain("\"componentName\":\"core:title\"");
    [Fact] void should_reopen_the_data_binding_as_a_core_element() => _reopened.ShouldContain("\"componentName\":\"core:data\"");
    [Fact] void should_reopen_the_table_with_its_columns() => _reopened.ShouldContain("\"componentName\":\"core:column\"");
    [Fact] void should_reopen_the_summary_with_its_fields() => _reopened.ShouldContain("\"componentName\":\"core:field\"");
    [Fact] void should_not_keep_the_directives_natively_as_well() => JsonNode.Parse(_reopened)!["native"]?["slots"]?.ToJsonString().ShouldNotContain("title \\\"Orders\\\"");
}
