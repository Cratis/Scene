// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;

namespace Cratis.Scene.Engine.for_ApprovedPackageSetJson;

public class when_reading_invalid_documents : given.a_package_set_document
{
    static IReadOnlyList<string> Diagnose(string json, params string[] reserved) => ApprovedPackageSetJson.Read(json, reserved).Diagnostics;

    [Fact] void should_refuse_text_that_is_not_json() => Diagnose("{").Single().StartsWith("The package set is not a valid document", StringComparison.Ordinal).ShouldBeTrue();

    [Fact] void should_refuse_an_unknown_member() => Diagnose("""{ "version": 1, "packages": [], "bundles": [] }""").Single().ShouldContain("bundles");

    [Fact] void should_refuse_another_version() => Diagnose("""{ "version": 2, "packages": [] }""").Single().ShouldContain("version 2");

    [Fact] void should_refuse_a_name_a_host_ships() => Diagnose(WithPackage(GoodManifest.Replace("Acme.Charts", "core"), GoodModule), "core").Single().ShouldContain("name of a package the host ships");

    [Fact] void should_refuse_a_package_approved_twice() => Diagnose($$"""{ "version": 1, "packages": [ { "manifest": {{GoodManifest}}, "module": {{GoodModule}} }, { "manifest": {{GoodManifest}}, "module": {{GoodModule}} } ] }""").Single().ShouldContain("approved more than once");

    [Fact] void should_refuse_an_icon_library() => Diagnose(WithPackage(GoodManifest.Replace("ComponentLibrary", "IconLibrary"), GoodModule)).Single().ShouldContain("icon library");

    [Fact] void should_refuse_an_invalid_npm_name() => Diagnose(WithPackage(GoodManifest, GoodModule.Replace("@acme/charts", "Not A Package"))).Single().ShouldContain("valid npm package name");

    [Fact] void should_refuse_an_export_that_is_not_an_identifier() => Diagnose(WithPackage(GoodManifest, GoodModule.Replace("acmeCharts", "a-b"))).Single().ShouldContain("module export");

    [Fact] void should_refuse_a_url_style_sheet() => Diagnose(WithPackage(GoodManifest, GoodModule.Replace("}", """, "styles": ["https://cdn.example/a.css"] }"""))).Single().ShouldContain("never a URL");

    [Fact] void should_refuse_a_style_sheet_of_another_package() => Diagnose(WithPackage(GoodManifest, GoodModule.Replace("}", """, "styles": ["@other/pkg/a.css"] }"""))).Single().ShouldContain("inside its own npm package");

    [Fact] void should_refuse_a_manifest_module_that_differs_from_the_import() => Diagnose(WithPackage(GoodManifest.Replace("}", """, "module": "@other/pkg" }"""), GoodModule)).Single().ShouldContain("declares the manifest module");

    [Fact] void should_refuse_a_missing_module() => Diagnose($$"""{ "version": 1, "packages": [ { "manifest": {{GoodManifest}} } ] }""").Single().ShouldContain("both a manifest and a module");

    [Fact] void should_return_no_set_when_there_are_diagnostics() => ApprovedPackageSetJson.Read("{", []).Set.ShouldBeNull();
}
