// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Screenplay.Reverse.for_SceneNavigation.given;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneOutletLevels;

// Cratis/StudioIssues#1331: where a hook opens its slice, what it acts on, when it is enabled and what its screen fits travel as the Screenplay 6 `opens`,
// `runs`, `for item`, `enabled when` and `fits`, arrive in the Scene document as the hook's `opens`, `opensIn`, `subject` and `enabledWhen` and the screen's
// `fits`, and are written again as the same Screenplay.
public class when_round_tripping_where_a_hook_opens_and_when_it_is_enabled : a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category application
          content
          outlet rowActions of actions for item

        module Shop
          feature Orders
            slice StateChange SetPrice
              command SetPrice
                orderId Uuid identifier
                produces PriceSet
                  for orderId
              event PriceSet
                orderId Uuid
              screen SetPrice
                title "Set price"
                fits drawer, dialog
                outlet rowActions extends
                  button price title "Set price" opens drawer for item
                    enabled when item.status == "onSale" and item.stock > 0
                  button audit title "Audit" opens dialog
            slice StateChange Withdraw
              command Withdraw
                orderId Uuid identifier
                produces Withdrawn
                  for orderId
              event Withdrawn
                orderId Uuid
        """;

    JsonObject _toolbar = null!;
    JsonObject _price = null!;
    JsonObject _audit = null!;

    void Because()
    {
        RoundTrip(Source);
        var levels = Documents.SelectMany(document => ((JsonArray?)document["outletLevels"] ?? []).OfType<JsonObject>());
        _toolbar = levels.First(level => level["kind"]!.GetValue<string>() == "screen")["refinements"]![0]!.AsObject();
        _price = _toolbar["items"]!.AsArray().OfType<JsonObject>().First(item => item["id"]!.GetValue<string>() == "price");
        _audit = _toolbar["items"]!.AsArray().OfType<JsonObject>().First(item => item["id"]!.GetValue<string>() == "audit");
    }

    [Fact] void should_import() => Imported.Compilation.Success.ShouldBeTrue();
    [Fact] void should_open_the_drawer() => _price["opens"]!.GetValue<string>().ShouldEqual("drawer");
    [Fact] void should_act_on_an_item() => _price["subject"]!.GetValue<string>().ShouldEqual("item");
    [Fact] void should_keep_when_it_is_enabled() => _price["enabledWhen"]!.GetValue<string>().ShouldEqual("item.status == \"onSale\" and item.stock > 0");
    [Fact] void should_open_a_dialog() => _audit["opens"]!.GetValue<string>().ShouldEqual("dialog");
    [Fact] void should_keep_what_the_screen_fits() => Documents.SelectMany(document => ((JsonArray?)document["screens"] ?? []).OfType<JsonObject>()).First(screen => screen["fits"] is not null)["fits"]!.ToJsonString().ShouldEqual("[\"drawer\",\"dialog\"]");
    [Fact] void should_export_where_it_opens() => Exported.ShouldContain("opens drawer");
    [Fact] void should_export_what_it_acts_on() => Exported.ShouldContain("for item");
    [Fact] void should_export_when_it_is_enabled() => Exported.ShouldContain("enabled when item.status == \"onSale\" and item.stock > 0");
    [Fact] void should_export_the_dialog() => Exported.ShouldContain("opens dialog");
    [Fact] void should_export_what_the_screen_fits() => Exported.ShouldContain("fits drawer, dialog");
    [Fact] void should_export_without_a_warning() => Warnings.ShouldBeEmpty();
    [Fact] void should_not_keep_the_document_on_the_preservation_carrier() => Exported.ShouldNotContain("StudioSceneDocument");
    [Fact] void should_export_a_document_that_compiles() => Reopened.Compilation.Success.ShouldBeTrue();
}
