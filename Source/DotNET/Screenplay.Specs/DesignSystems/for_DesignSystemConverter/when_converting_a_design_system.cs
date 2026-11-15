// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Screenplay.DesignSystems.for_DesignSystemConverter;

public class when_converting_a_design_system : given.a_compiled_design_system
{
    void Because() => Convert(Source);

    [Fact] void should_convert_the_design_system() => _designSystem.ShouldNotBeNull();
    [Fact] void should_keep_its_name() => _designSystem!.Name.ShouldEqual("ShopDesign");
    [Fact] void should_keep_its_modes() => _designSystem!.Modes.ShouldContainOnly("light", "dark");
    [Fact] void should_keep_every_token_role() => _designSystem!.Tokens.Select(token => $"{token.Category}.{token.Name}").ShouldContainOnly("color.surface", "color.text", "color.primary", "color.on-primary", "space.md", "radius.control");
    [Fact] void should_keep_what_a_token_is_for() => _designSystem!.Tokens.Single(token => token.Name == "primary").Description.ShouldEqual("primary action");
    [Fact] void should_keep_the_parts_of_a_component() => _designSystem!.Components.Single().Parts.ShouldContainOnly("text", "background", "radius");
    [Fact] void should_assign_each_part_of_a_variant_a_token_role() => _designSystem!.Components.Single().Variants.Single().Parts["background"].ShouldEqual("color.primary");
    [Fact] void should_keep_the_parts_a_state_overrides() => _designSystem!.Components.Single().Variants.Single().States!["disabled"]["text"].ShouldEqual("color.text");
    [Fact] void should_link_by_name_when_no_mapping_is_given() => _designSystem!.Components.Single().Mapping.ShouldBeNull();
    [Fact] void should_convert_the_theme_that_implements_it() => Daylight.Name.ShouldEqual("Daylight");
    [Fact] void should_mark_the_default_theme() => Daylight.IsDefault.ShouldBeTrue();
    [Fact] void should_resolve_each_mode() => Daylight.Modes.Select(mode => mode.Mode).ShouldContainOnly("light", "dark");
    [Fact] void should_resolve_a_token_through_the_palette() => Mode("light").Tokens["color.primary"].ShouldEqual("#4338CA");
    [Fact] void should_resolve_a_token_per_mode() => Mode("dark").Tokens["color.surface"].ShouldEqual("#111827");
    [Fact] void should_resolve_a_token_that_holds_a_literal() => Mode("light").Tokens["space.md"].ShouldEqual("12px");
    [Fact] void should_resolve_the_parts_of_a_component_to_values() => Mode("light").Components!.Single().Variants.Single().Parts["background"].ShouldEqual("#4338CA");
    [Fact] void should_resolve_the_states_of_a_component() => Mode("dark").Components!.Single().Variants.Single().States!["disabled"]["background"].ShouldEqual("#111827");
    [Fact] void should_find_no_problem() => Mode("light").Problems.ShouldBeNull();
    [Fact] void should_keep_the_words() => _designSystem!.Words!.Voice!["tone"].ShouldEqual("Plain and exact");
    [Fact] void should_keep_the_naming() => _designSystem!.Words!.Naming!["customer"].ShouldEqual("Client");
    [Fact] void should_keep_the_contrast_rule() => _designSystem!.ContrastRules!.Single().ShouldEqual(new ContrastRule("text", "background", 4.5));
    [Fact] void should_measure_the_rule_in_every_mode_of_every_theme() => _designSystem!.ContrastFindings!.Select(finding => finding.Mode).Distinct().ShouldContainOnly("light", "dark");
    [Fact] void should_find_every_measured_ratio_enough() => _designSystem!.ContrastFindings!.All(finding => finding.Ratio >= finding.Required).ShouldBeTrue();
    [Fact] void should_report_nothing() => _diagnostics.All.ShouldBeEmpty();
}
