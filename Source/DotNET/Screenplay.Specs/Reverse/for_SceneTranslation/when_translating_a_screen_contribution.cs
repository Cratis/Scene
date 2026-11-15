// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;

namespace Cratis.Scene.Screenplay.Forward.for_SceneTranslation;

public class when_translating_a_screen_contribution : Specification
{
    CompilationResult<Cratis.Scene.Screenplay.Forward.SceneApplication> _result = null!;

    void Because() => _result = SceneTranslation.Translate(new ScreenplayCompiler().Compile(given.StageRenderedScreenplays.WithAScreenContribution));

    [Fact] void should_succeed() => _result.Success.ShouldBeTrue();
    [Fact] void should_report_no_errors() => _result.Diagnostics.ShouldBeEmpty();
    [Fact] void should_emit_the_screen() => _result.Value!.Screens.Select(screen => screen.Name).ShouldContainOnly("Orders");
    [Fact] void should_carry_the_contribution_to_its_point() => _result.Value!.Screens.Single().Contributions.Single().ContributionPointName.ShouldEqual("Navigation");
    [Fact] void should_carry_its_order() => _result.Value!.Screens.Single().Contributions.Single().Order.ShouldEqual(1);
}
