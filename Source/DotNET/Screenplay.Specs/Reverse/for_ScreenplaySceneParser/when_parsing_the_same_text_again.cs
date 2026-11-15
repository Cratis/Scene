// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward.for_ScreenplaySceneParser;

// StudioIssues#979: the next preview of a board that has not changed hands over the same text; it is compiled once, not for every click.
public class when_parsing_the_same_text_again : Specification
{
    const string Invoicing = """
        module Invoicing
          screen template AppShell
            navbar
            main
            outlet Navigation of navigation in navbar

          feature InvoiceManagement
            slice StateView InvoiceList
              screen InvoiceList
        """;

    ScreenplaySceneParser _parser = null!;
    Cratis.Screenplay.CompilationResult<Cratis.Scene.Screenplay.Forward.SceneApplication> _first = null!;
    Cratis.Screenplay.CompilationResult<Cratis.Scene.Screenplay.Forward.SceneApplication> _again = null!;
    Cratis.Screenplay.CompilationResult<Cratis.Scene.Screenplay.Forward.SceneApplication> _other = null!;

    void Establish() => _parser = new();

    void Because()
    {
        _first = _parser.Parse(Invoicing);
        _again = _parser.Parse(Invoicing);
        _other = _parser.Parse(Invoicing.Replace("InvoiceManagement", "Billing"));
    }

    [Fact] void should_have_made_a_scene() => _first.Success.ShouldBeTrue();
    [Fact] void should_hand_back_the_remembered_result() => ReferenceEquals(_first.Value, _again.Value).ShouldBeTrue();
    [Fact] void should_compile_other_text_on_its_own() => ReferenceEquals(_first.Value, _other.Value).ShouldBeFalse();
}
