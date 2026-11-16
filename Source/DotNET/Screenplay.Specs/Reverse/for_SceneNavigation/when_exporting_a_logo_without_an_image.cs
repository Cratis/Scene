// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneNavigation;

// Cratis/StudioIssues#666: the canonical screen composition corpus declares `logo image "" title "Acme"` (a logo that is a title only).
// The export keeps it as typed Screenplay instead of falling back to the preserved native document.
public class when_exporting_a_logo_without_an_image : given.a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category application
          content

          outlet topbar of navigation
            logo image "" title "Acme"
            default home title "Home" target Home

        module Home
          feature Welcome
            slice StateView WelcomeList
              readmodel WelcomeRow
                text String
              screen Welcome
                title "Welcome"
        """;

    ApplicationSyntax _application = null!;

    void Because()
    {
        RoundTrip(Source);
        _application = Reopened.Compilation.Value is { } ? new ScreenplayCompiler().Compile(Exported).Value : null;
    }

    [Fact] void should_export_without_a_warning() => Warnings.ShouldBeEmpty();
    [Fact] void should_export_a_document_that_compiles() => Reopened.Compilation.Success.ShouldBeTrue();
    [Fact] void should_export_the_logo_with_its_empty_image() => Exported.ShouldContain("logo image \"\" title \"Acme\"");
    [Fact] void should_not_fall_back_to_the_preserved_document() => Exported.ShouldNotContain("studio-scene-document");
    [Fact] void should_put_the_logo_on_the_layout_topbar() => _application.Layouts.First().Outlets.Single(outlet => outlet.Name == "topbar").Logo.Title.ShouldEqual("Acme");
}
