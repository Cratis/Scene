// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.DesignSystems.for_DesignSystemConverter;

public class when_a_theme_leaves_a_token_without_a_value : given.a_compiled_design_system
{
    void Because() => Convert(Source.Replace("    color.on-primary = palette.white\n\n  dark", "\n  dark"));

    [Fact] void should_still_convert_the_theme() => Daylight.Modes.Count.ShouldEqual(2);
    [Fact] void should_name_what_could_not_be_resolved_in_the_mode_it_is_missing_from() => Mode("light").Problems.ShouldNotBeEmpty();
    [Fact] void should_leave_the_mode_that_has_every_value_clean() => Mode("dark").Problems.ShouldBeNull();
    [Fact] void should_not_invent_a_value() => Mode("light").Tokens.ContainsKey("color.on-primary").ShouldBeFalse();
}
