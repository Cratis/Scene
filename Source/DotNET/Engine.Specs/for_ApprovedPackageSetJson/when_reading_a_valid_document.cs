// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.for_ApprovedPackageSetJson;

public class when_reading_a_valid_document : given.a_package_set_document
{
    ApprovedPackageSetReadResult _result = null!;
    string _written = null!;
    ApprovedPackageSetReadResult _reread = null!;

    void Because()
    {
        _result = ApprovedPackageSetJson.Read(Valid, ["core"]);
        _written = ApprovedPackageSetJson.Write(_result.Set!);
        _reread = ApprovedPackageSetJson.Read(_written, ["core"]);
    }

    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();

    [Fact] void should_order_packages_by_ordinal_name() => _result.Set!.Packages.Select(_ => _.Manifest.Name).ShouldEqual(["Acme.Charts", "Zeta.Widgets"]);

    [Fact] void should_expose_the_manifests_as_the_planning_catalog() => _result.Set!.Catalog.Select(_ => (_.Name, _.Kind)).ShouldEqual([("Acme.Charts", PackageKind.ComponentLibrary), ("Zeta.Widgets", PackageKind.ComponentLibrary)]);

    [Fact] void should_carry_dependencies_and_components() => (_result.Set!.Packages[0].Manifest.Dependencies.Single().VersionRange, string.Join(',', _result.Set.Packages[0].Manifest.Components)).ShouldEqual((">=4.0.0", "chart,spark"));

    [Fact] void should_set_the_manifest_module_to_the_npm_package() => _result.Set!.Packages[0].Manifest.Module.ShouldEqual("@acme/scene.charts");

    [Fact] void should_carry_the_module_reference() => (_result.Set!.Packages[1].Module.Npm, _result.Set.Packages[1].Module.Version, _result.Set.Packages[1].Module.Export, string.Join(',', _result.Set.Packages[1].Module.Styles)).ShouldEqual(("@zeta/widgets", "^2.0.0", "zetaWidgets", "@zeta/widgets/styles.css"));

    [Fact] void should_write_a_document_that_reads_back_to_the_same_bytes() => ApprovedPackageSetJson.Write(_reread.Set!).ShouldEqual(_written);

    [Fact] void should_write_with_a_trailing_line_feed_only() => (_written.EndsWith('\n') && !_written.Contains('\r')).ShouldBeTrue();
}
