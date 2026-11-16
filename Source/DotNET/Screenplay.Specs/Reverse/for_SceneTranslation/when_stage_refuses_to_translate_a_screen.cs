// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Forward.for_SceneTranslation;

public class when_stage_refuses_to_translate_a_screen : Specification
{
    CompilationResult<Cratis.Scene.Screenplay.Forward.SceneApplication> _result = null!;
    CompilationResult<ApplicationSyntax> _compiled = null!;
    Exception? _thrown;

    void Because()
    {
        _compiled = new ScreenplayCompiler().Compile(given.StageRefusedScreenplays.WithMixedScreenContent);
        _thrown = Cratis.Specifications.Catch.Exception(() => _result = SceneTranslation.Translate(_compiled));
    }

    Diagnostic Refusal => _result.Diagnostics.Single(diagnostic => diagnostic.Code == SceneTranslation.RefusedTranslation);

    [Fact] void should_compile_the_screenplay() => _compiled.Success.ShouldBeTrue();
    [Fact] void should_not_throw() => _thrown.ShouldBeNull();
    [Fact] void should_not_succeed() => _result.Success.ShouldBeFalse();
    [Fact] void should_refuse_as_an_error() => Refusal.Severity.ShouldEqual(DiagnosticSeverity.Error);
    [Fact] void should_name_the_screen_stage_refused() => Refusal.Message.ShouldContain("Screen 'Orders'");
    [Fact] void should_keep_stages_own_refusal() => Refusal.Message.ShouldContain("mixes a top-level template directive with other top-level directives, which is not yet supported");
    [Fact] void should_point_at_the_screen() => Refusal.Location.Line.ShouldEqual(8);
    [Fact] void should_point_at_the_screen_column() => Refusal.Location.Column.ShouldEqual(7);
    [Fact] void should_say_where_in_the_message() => Refusal.Message.ShouldContain("(at line 8, column 7)");
}
