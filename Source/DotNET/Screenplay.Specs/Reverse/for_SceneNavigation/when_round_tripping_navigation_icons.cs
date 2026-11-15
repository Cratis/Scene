// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

public class when_round_tripping_navigation_icons : given.a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category application
          content
          outlet topbar of navigation
            default orders title "Orders" icon receipt target Shop
            default qualified title "Qualified" icon "Cratis.Icons.Lucide#receipt" target Shop
            default variant title "Variant" icon "Other.Icons#tag#filled" target Shop
            default unknown title "Unknown" icon not-an-icon target Shop
            default plain title "Plain" target Shop
          outlet topbarActions of actions
            default add title "Add" icon plus
            default qualifiedButton title "Qualified" icon "Other.Icons#plus#filled"
            default unknownButton title "Unknown" icon not-an-icon
            default plainButton title "Plain"
          outlet sidebar of navigation
            default stock title "Stock" icon box target Shop
              item nested title "Nested" icon truck target Shop
            default tags title "Tags" icon tag target Shop

        module Shop
          outlet topbar extends
            item cart title "Cart" icon shopping-cart target Shop
          outlet topbarActions extends
            button moduleAdd title "Add" icon plus
          feature Orders
            slice StateView OrderList
              readmodel OrderRow
                orderId Uuid
              screen List
                title "Orders"
        """;

    JsonNode Item(int index) => Outlet("topbar")["defaults"]![index]!;
    JsonNode Button(int index) => Outlet("topbarButtons")["defaults"]![index]!;
    JsonNode SidebarItems => Outlet("sidebar")["defaults"]!;

    JsonObject Outlet(string name) => Documents[0]["navigation"]!["application"]!["outlets"]!.AsArray().OfType<JsonObject>().Single(outlet => outlet["name"]!.GetValue<string>() == name);

    JsonObject Refinement(string outlet) => Documents[0]["navigation"]!["modules"]![0]!["refinements"]!.AsArray().OfType<JsonObject>().Single(refinement => refinement["outlet"]!.GetValue<string>() == outlet);

    void Because() => RoundTrip(Source);

    [Fact] void should_import() => Imported.Compilation.Success.ShouldBeTrue();
    [Fact] void should_export_without_warnings_or_carriers() => Warnings.ShouldBeEmpty();
    [Fact] void should_qualify_a_bare_item() => Item(0)["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#receipt");
    [Fact] void should_keep_the_original_bare_spelling() => Item(0)["screenplayIcon"]!.GetValue<string>().ShouldEqual("receipt");
    [Fact] void should_qualify_nested_items() => SidebarItems[0]!["children"]![0]!["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#truck");
    [Fact] void should_not_change_a_qualified_lucide_reference() => Item(1)["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#receipt");
    [Fact] void should_not_mark_an_explicitly_qualified_reference_as_bare() => Item(1)["screenplayIcon"].ShouldBeNull();
    [Fact] void should_not_change_another_library_or_variant() => Item(2)["icon"]!.GetValue<string>().ShouldEqual("Other.Icons#tag#filled");
    [Fact] void should_qualify_an_unknown_item_without_rejecting_it() => Item(3)["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#not-an-icon");
    [Fact] void should_leave_an_absent_icon_absent() => Item(4)["icon"].ShouldBeNull();
    [Fact] void should_qualify_sidebar_icons() => SidebarItems.AsArray().Select(item => item!["icon"]!.GetValue<string>()).ShouldEqual(["Cratis.Icons.Lucide#box", "Cratis.Icons.Lucide#tag"]);
    [Fact] void should_qualify_module_items() => Refinement("topbar")["items"]![0]!["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#shopping-cart");
    [Fact] void should_qualify_a_bare_button() => Button(0)["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#plus");
    [Fact] void should_keep_a_qualified_button_reference() => Button(1)["icon"]!.GetValue<string>().ShouldEqual("Other.Icons#plus#filled");
    [Fact] void should_qualify_an_unknown_button_without_rejecting_it() => Button(2)["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#not-an-icon");
    [Fact] void should_leave_an_absent_button_icon_absent() => Button(3)["icon"].ShouldBeNull();
    [Fact] void should_qualify_module_buttons() => Refinement("topbarButtons")["items"]![0]!["icon"]!.GetValue<string>().ShouldEqual("Cratis.Icons.Lucide#plus");
    [Fact] void should_export_the_original_item_text() => Exported.ShouldContain("default orders title \"Orders\" icon receipt target Shop");
    [Fact] void should_export_the_original_button_text() => Exported.ShouldContain("default add title \"Add\" icon plus");
    [Fact] void should_export_the_original_unknown_text() => Exported.ShouldContain("icon not-an-icon");
    [Fact] void should_keep_explicit_lucide_qualification_on_export() => Exported.ShouldContain("Cratis.Icons.Lucide#receipt");
    [Fact] void should_keep_explicit_button_qualification_on_export() => Exported.ShouldContain("Other.Icons#plus#filled");
    [Fact] void should_reopen_identical_navigation() => Reopened.CustomCode.Screens.Select(screen => JsonNode.Parse(screen.Document)!["navigation"]!.ToJsonString()).ShouldEqual(Documents.Select(document => document["navigation"]!.ToJsonString()));
}
