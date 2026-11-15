// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNative;

// A theme names the design system it implements. Keeping the theme without its design system left an application whose preview did not compile
// ("Theme 'AcmeCatalog' implements 'AcmeDesign', but the application declares no design system"), so a board lost the arrows to where its screens open.
public class when_keeping_a_theme_that_implements_a_design_system : Specification
{
    const string Document =
        """
        design system Small
          modes light
          default theme Mine

          tokens
            color
              surface "page background"

        theme Mine
          implements Small

          values
            color.surface = "#FFFFFF"
        """;

    NativeResidue _kept = null!;
    string? _residue;

    void Because()
    {
        var application = new ScreenplayCompiler().Compile(Document).Value!;
        _residue = SceneNative.ApplicationResidue(application);
        var document = new JsonObject { [SceneNative.Member] = new JsonObject { ["application"] = _residue } };
        _kept = SceneNative.ResidueOf([document]);
    }

    [Fact] void should_keep_the_theme() => _kept.Themes.Select(theme => theme.Name).ShouldContainOnly(["Mine"]);
    [Fact] void should_keep_the_design_system_it_implements() => _kept.DesignSystems.Select(designSystem => designSystem.Name).ShouldContainOnly(["Small"]);
    [Fact] void should_keep_what_compiles_on_its_own() => new ScreenplayCompiler().Compile(_residue!).Success.ShouldBeTrue();
}
