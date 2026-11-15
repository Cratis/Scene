// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.RoundTrip.for_ScreenplaySceneRoundTrip;

public class when_round_tripping_the_design_system : given.a_round_tripped_screenplay
{
    void Because() => RoundTrip(given.Applications.Design + "\n" + given.Applications.Shell + "\n" + given.Applications.Screens);

    [Fact] void should_bring_back_the_design_system_as_it_was() => Printed(designSystems: _returned.DesignSystems).ShouldEqual(Printed(designSystems: _original.DesignSystems));
    [Fact] void should_bring_back_the_theme_that_implements_it() => Printed(themes: _returned.Themes).ShouldEqual(Printed(themes: _original.Themes));
    [Fact] void should_bring_back_exactly_one_design_system() => _returned.DesignSystems.Count().ShouldEqual(1);
    [Fact] void should_report_nothing_it_could_not_say() => _printed.Warnings.ShouldBeEmpty();
    [Fact] void should_not_differ_under_model_comparison() => Compare(Printed(null, null, _original.Themes, _original.DesignSystems), Printed(null, null, _returned.Themes, _returned.DesignSystems)).Declarations.ShouldBeEmpty();
}
