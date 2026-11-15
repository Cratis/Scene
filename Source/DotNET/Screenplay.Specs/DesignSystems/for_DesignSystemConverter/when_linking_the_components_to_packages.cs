// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Design;
using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Screenplay.DesignSystems.for_DesignSystemConverter;

public class when_linking_the_components_to_packages : given.a_compiled_design_system
{
    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web);

    static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> _catalog = new Dictionary<string, IReadOnlyList<string>>
    {
        ["Lib"] = ["button"],
        ["Fancy"] = ["fancyButton"]
    };

    DesignLinking _byName = null!;
    DesignLinking _mapped = null!;
    DesignLinking _unmatched = null!;

    void Because()
    {
        var profile = JsonSerializer.Deserialize<UiProfile>("""{"name":"Web","targetPlatform":"web","packages":["Lib","Fancy"]}""", _options)!;
        var supported = new ComponentAnatomy(["text", "background", "radius"], ["primary"], ["disabled"]);

        Convert(Source);
        _byName = DesignSystemConverter.Link(_designSystem!, profile, _catalog, [new("Lib:button", ["variant"], supported)]);

        Convert(Source, new Dictionary<string, ComponentMapping> { ["Button"] = new("Fancy.fancyButton", "tone", new Dictionary<string, string> { ["primary"] = "brand" }) });
        _mapped = DesignSystemConverter.Link(_designSystem!, profile, _catalog, [new("Fancy:fancyButton", [], supported with { VariantProperty = "tone" })]);

        Convert(Source);
        _unmatched = DesignSystemConverter.Link(_designSystem!, profile, _catalog, [new("Lib:button", ["variant"], new(["text"], ["primary"], []))]);
    }

    [Fact] void should_link_a_component_to_the_package_component_of_the_same_name() => _byName.Links.Single().Component.ShouldEqual("button");
    [Fact] void should_say_which_package_renders_it() => _byName.Links.Single().Package.ShouldEqual("Lib");
    [Fact] void should_pass_the_variant_in_the_well_known_property() => _byName.Links.Single().VariantProperty.ShouldEqual("variant");
    [Fact] void should_report_nothing_for_a_component_that_supports_the_anatomy() => _byName.Diagnostics.ShouldBeEmpty();
    [Fact] void should_link_a_component_to_the_one_it_maps_to() => _mapped.Links.Single().Component.ShouldEqual("fancyButton");
    [Fact] void should_pass_the_variant_in_the_property_the_mapping_states() => _mapped.Links.Single().VariantProperty.ShouldEqual("tone");
    [Fact] void should_carry_the_values_the_mapping_states_for_a_variant() => _mapped.Links.Single().VariantValues["primary"].ShouldEqual("brand");
    [Fact] void should_report_every_part_the_package_component_does_not_support() => _unmatched.Diagnostics.ShouldNotBeEmpty();
}
