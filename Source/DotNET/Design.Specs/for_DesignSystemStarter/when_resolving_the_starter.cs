// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.for_DesignSystemStarter;

public class when_resolving_the_starter : given.a_compiled_starter
{
    void Because() => Compile(DesignSystemStarter.Create());

    [Fact] void should_convert_the_design_system() => _designSystem.ShouldNotBeNull();
    [Fact] void should_report_no_conversion_diagnostic() => _conversion.All.ShouldBeEmpty();
    [Fact] void should_resolve_every_mode_of_the_theme_without_a_problem() => Problems.ShouldBeEmpty();
    [Fact] void should_give_the_theme_both_modes() => _designSystem!.Themes.Single().Modes.Select(mode => mode.Mode).ShouldContainOnly("light", "dark");
    [Fact] void should_make_the_theme_the_default() => _designSystem!.Themes.Single().IsDefault.ShouldBeTrue();
    [Fact] void should_measure_the_contrast_rule() => _designSystem!.ContrastFindings.ShouldNotBeEmpty();
    [Fact] void should_meet_the_contrast_rule_in_every_mode() => _designSystem!.ContrastFindings!.Where(finding => finding.Ratio < finding.Required).ShouldBeEmpty();
}
