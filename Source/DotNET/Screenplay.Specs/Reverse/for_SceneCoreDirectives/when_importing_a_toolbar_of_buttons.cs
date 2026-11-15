// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

using Cratis.Scene.Screenplay.Reverse.given;
namespace Cratis.Scene.Screenplay.Reverse.for_SceneCoreDirectives;

// A toolbar of buttons in a template slot imports as the outlet of actions Scene draws it with, so the screen editor edits its buttons - the slice
// each one issues, its emphasis, what it acts on - instead of keeping the toolbar as text it cannot change. It exports as the same toolbar again.
public class when_importing_a_toolbar_of_buttons : Specification
{
    const string Source =
        """
        module Merchandising
          feature Products
            slice StateView ProductCatalog
              readmodel ProductRow
                productId Uuid
                status String
              query AllProducts => observable ProductRow[]
              screen ProductCatalog
                template blueprint Cratis.Blueprint.Default ListScreen version "^1"
                  toolbar
                    toolbar actions
                      button new title "New product" slice Merchandising.Products.DraftProduct emphasis primary icon plus
                      button approve title "Approve for sale" slice Merchandising.Products.ApproveProduct for item icon check
                        runs
                        enabled when item.status == "draft"
                  list
                    data ProductRow[] via query AllProducts
                    table ProductRow
                      column status label "Status"
            slice StateChange DraftProduct
              command DraftProduct
                productId Uuid identifier
                name String
                produces ProductDrafted
                  for productId
              event ProductDrafted
                productId Uuid
                name String
              screen NewProduct
                fits dialog
                action DraftProduct
            slice StateChange ApproveProduct
              command ApproveProduct
                productId Uuid identifier
                produces ProductApproved
                  for productId
              event ProductApproved
                productId Uuid
        """;

    JsonObject _screen = null!;
    JsonObject _toolbar = null!;
    string _exported = string.Empty;

    void Because()
    {
        var imported = DocumentTransport.Import(Source);
        var document = imported.CustomCode.Screens.Single(screen => screen.Document.Contains("Approve for sale", StringComparison.Ordinal)).Document;
        _screen = JsonNode.Parse(document)!["screens"]![0]!.AsObject();
        _toolbar = _screen["slotContent"]!["toolbar"]![0]!.AsObject();
        (_exported, _) = SceneDocumentScreenplayText.OfScreen("Merchandiser", string.Empty, document);
    }

    [Fact] void should_place_an_outlet_of_actions() => _toolbar["componentName"]!.GetValue<string>().ShouldEqual("core:outletItems");
    [Fact] void should_name_the_outlet_by_the_toolbar() => _toolbar["properties"]!["name"]!.GetValue<string>().ShouldEqual("actions");
    [Fact] void should_carry_every_button() => _toolbar["properties"]!["items"]!.AsArray().Select(item => item!["title"]!.GetValue<string>()).ShouldContainOnly("New product", "Approve for sale");
    [Fact] void should_carry_the_slice_of_a_button() => _toolbar["properties"]!["items"]![0]!["slice"]!.GetValue<string>().ShouldEqual("Merchandising.Products.DraftProduct");
    [Fact] void should_carry_what_a_button_acts_on() => _toolbar["properties"]!["items"]![1]!["subject"]!.GetValue<string>().ShouldEqual("item");
    [Fact] void should_not_keep_the_toolbar_as_text() => (_screen["native"]?["slots"]?["toolbar"]?.ToJsonString() ?? string.Empty).ShouldNotContain("toolbar actions");
    [Fact] void should_export_the_toolbar_again() => _exported.ShouldContain("toolbar actions");
    [Fact] void should_export_the_buttons_again() => _exported.ShouldContain("button approve title \"Approve for sale\" slice Merchandising.Products.ApproveProduct");
    [Fact] void should_export_the_condition_of_a_button_again() => _exported.ShouldContain("enabled when item.status == \"draft\"");
}
