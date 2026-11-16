// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneTemplateReferences;

// Cratis/StudioIssues#666: a screen that fills a blueprint's template - `template blueprint <Blueprint> <Name> version "<range>"` -
// keeps the blueprint and the version range it pins through an import and an export; a Scene screen names its template and no more,
// so they are not dropped with the name.
public class when_a_screen_names_a_blueprint_template : for_SceneNavigation.given.a_navigated_application
{
    const string Source =
        """
        module Shop
          feature Orders
            slice StateView OrderList
              readmodel OrderRow
                orderId Uuid
              screen Pinned
                template blueprint Crm CustomerDetail version "^1.4"
              screen Unpinned
                template blueprint Crm CustomerDetail
              screen Own
                template MasterDetail
          screen template MasterDetail
            scopes feature, slice
            header
            list
        """;

    // The screens of the documents the import produced, in the order the source declares them.
    JsonObject Screen(string name) => Documents.SelectMany(document => ((JsonArray)document["screens"]!).OfType<JsonObject>()).ElementAt(Array.IndexOf(["Pinned", "Unpinned", "Own"], name));

    void Because() => RoundTrip(Source);

    [Fact] void should_import() => Imported.Compilation.Success.ShouldBeTrue();
    [Fact] void should_name_the_template_in_the_document() => Screen("Pinned")["screenTemplate"]!.GetValue<string>().ShouldEqual("CustomerDetail");
    [Fact] void should_keep_the_blueprint() => Screen("Pinned")["native"]!["template"]!["blueprint"]!.GetValue<string>().ShouldEqual("Crm");
    [Fact] void should_keep_the_version_range() => Screen("Pinned")["native"]!["template"]!["version"]!.GetValue<string>().ShouldEqual("^1.4");
    [Fact] void should_keep_a_reference_that_pins_no_version() => Screen("Unpinned")["native"]!["template"]!["version"].ShouldBeNull();
    [Fact] void should_keep_nothing_for_an_own_template() => Screen("Own")["native"]?["template"].ShouldBeNull();
    [Fact] void should_export_the_pinned_reference() => Exported.ShouldContain("template blueprint Crm CustomerDetail version \"^1.4\"");
    [Fact] void should_export_the_unpinned_reference() => Exported.ShouldContain("template blueprint Crm CustomerDetail\n");
    [Fact] void should_export_the_own_reference() => Exported.ShouldContain("template MasterDetail");
    [Fact] void should_export_without_a_warning() => Warnings.ShouldBeEmpty();
    [Fact] void should_export_a_document_that_compiles() => Reopened.Compilation.Success.ShouldBeTrue();
}
