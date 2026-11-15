// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

// Cratis/StudioIssues#666, #1328: a board whose screen documents carry navigation exports it as the layout's outlets of navigation
// and the modules' outlet refinements, and the export compiles and reads back to the same navigation.
public class when_exporting_navigation_regions : given.a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category application
          content
          side

          outlet topbar of navigation
            logo image "/acme.svg" title "Acme"
            default sales title "Sales" icon receipt target Shop
            default support title "Support" target Support.Tickets slot side
          outlet sidebar of navigation
            default shop title "Shop" target Shop
              item orders title "Orders" target Shop.Orders

        module Shop
          outlet sidebar extends
            item more title "More" target Shop.Customers
          outlet topbar overrides
            item mine title "Mine" target Shop.Orders

          feature Orders
            slice StateView OrderList
              readmodel OrderRow
                orderId Uuid
              screen List
                title "Orders"
          feature Customers

        module Support
          outlet sidebar inherits
          feature Tickets
        """;

    ApplicationSyntax _application = null!;

    void Because()
    {
        RoundTrip(Source);
        _application = Reopened.Compilation.Value is { } ? new ScreenplayCompiler().Compile(Exported).Value : null;
    }

    [Fact] void should_export_without_a_warning() => Warnings.ShouldBeEmpty();
    [Fact] void should_export_a_document_that_compiles() => Reopened.Compilation.Success.ShouldBeTrue();
    [Fact] void should_export_the_topbar() => Exported.ShouldContain("outlet topbar of navigation");
    [Fact] void should_export_the_logo() => Exported.ShouldContain("logo image \"/acme.svg\" title \"Acme\"");
    [Fact] void should_export_a_default_item_with_icon_and_target() => Exported.ShouldContain("default sales title \"Sales\" icon receipt target Shop");
    [Fact] void should_export_a_slot() => Exported.ShouldContain("default support title \"Support\" target Support.Tickets slot side");
    [Fact] void should_export_sub_items() => Exported.ShouldContain("item orders title \"Orders\" target Shop.Orders");
    [Fact] void should_export_an_extending_module_outlet() => Exported.ShouldContain("outlet sidebar extends");
    [Fact] void should_export_an_overriding_module_outlet() => Exported.ShouldContain("outlet topbar overrides");
    [Fact] void should_export_an_inheriting_module_outlet() => Exported.ShouldContain("outlet sidebar inherits");
    [Fact] void should_put_the_outlets_of_navigation_on_the_layout() => _application.Layouts.First().Outlets.Where(outlet => outlet.Kind == OutletKind.Navigation).Select(outlet => outlet.Name).ShouldContainOnly("topbar", "sidebar");
    [Fact] void should_read_back_the_same_navigation() => SceneNavigation.Of(_application).Modules.Select(module => module.Module).ShouldContainOnly("Shop", "Support");
    [Fact] void should_reopen_the_same_documents() => Reopened.CustomCode.Screens.Select(screen => System.Text.Json.Nodes.JsonNode.Parse(screen.Document)["navigation"].ToJsonString()).Distinct().Single().ShouldEqual(Imported.CustomCode.Screens.Select(screen => System.Text.Json.Nodes.JsonNode.Parse(screen.Document)["navigation"].ToJsonString()).Distinct().Single());
}
