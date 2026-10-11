// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.for_ApprovedPackageSetJson.given;

public class a_package_set_document : Specification
{
    protected const string Valid =
        "{ \"version\": 1, \"packages\": [" +
        "{ \"manifest\": { \"name\": \"Zeta.Widgets\", \"version\": \"2.0.0\", \"kind\": \"ComponentLibrary\", \"components\": [\"gauge\"] }," +
        " \"module\": { \"npm\": \"@zeta/widgets\", \"version\": \"^2.0.0\", \"export\": \"zetaWidgets\", \"styles\": [\"@zeta/widgets/styles.css\"] } }," +
        "{ \"manifest\": { \"name\": \"Acme.Charts\", \"version\": \"1.2.0\", \"kind\": \"ComponentLibrary\"," +
        " \"dependencies\": [{ \"name\": \"Cratis.Components\", \"versionRange\": \">=4.0.0\" }], \"components\": [\"chart\", \"spark\"], \"displayName\": \"Acme charts\" }," +
        " \"module\": { \"npm\": \"@acme/scene.charts\", \"version\": \"1.2.0\", \"export\": \"acmeChartsRuntimePackage\" } }" +
        "] }";

    protected static string WithPackage(string manifest, string module) =>
        $$"""{ "version": 1, "packages": [ { "manifest": {{manifest}}, "module": {{module}} } ] }""";

    protected const string GoodManifest = """{ "name": "Acme.Charts", "version": "1.0.0", "kind": "ComponentLibrary", "components": ["chart"] }""";

    protected const string GoodModule = """{ "npm": "@acme/charts", "version": "1.0.0", "export": "acmeCharts" }""";
}
