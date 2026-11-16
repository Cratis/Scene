// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

// StudioIssues#894: the topbar of domains and the sidebar of module > feature of a multi-domain application are imported with one event model, kept, and exported again
// as written - the modules of the other event models stay targets by name.
public class when_round_tripping_the_navigation_of_a_multi_domain_application : given.a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category Shell
          content

          outlet topbar of navigation
            default shop title "Shop" target Shop
            default catalog title "Catalog" target Merchandising

          outlet sidebar of navigation
            default shop title "Shop" target Shop
              item browse title "Browse" target Shop.Browse
            default catalog title "Catalog" target Merchandising
              item products title "Products" target Merchandising.Products

        module Shop
          feature Browse
            slice StateView ProductBrowse
              readmodel ListedProduct
                productId Uuid
                sku String
              query AllListedProducts => observable ListedProduct[]
              screen Browse
                title "Shop"
        """;

    void Because() => RoundTrip(Source);

    [Fact] void should_export_without_a_warning_about_the_navigation() => Warnings.ShouldNotContain(warning => warning.Contains("Navigation", StringComparison.Ordinal));
    [Fact] void should_export_the_topbar_of_domains() => Exported.ShouldContain("default catalog title \"Catalog\" target Merchandising");
    [Fact] void should_export_the_feature_of_the_other_domain() => Exported.ShouldContain("item products title \"Products\" target Merchandising.Products");
    [Fact] void should_export_the_hierarchy_of_the_sidebar() => Exported.ShouldContain("item browse title \"Browse\" target Shop.Browse");
    [Fact] void should_import_the_export_again() => Reopened.Compilation.Success.ShouldBeTrue();
}
