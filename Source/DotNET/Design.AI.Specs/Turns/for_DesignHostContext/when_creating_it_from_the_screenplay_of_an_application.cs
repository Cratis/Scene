// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignHostContext;

public class when_creating_it_from_the_screenplay_of_an_application : Specification
{
    DesignHostContext _context = null!;

    void Because() => _context = DesignHostContext.FromScreenplay(Shop.Catalogue() with { Profile = null }, Shop.Screenplay, "v7", "For the invoicing slice");

    [Fact] void should_take_the_design_system_from_the_screenplay() => _context.Catalogue.DesignSystem!.Name.ShouldEqual("ShopDesign");
    [Fact] void should_take_the_tokens_of_the_design_system() => _context.Catalogue.DesignSystem!.Tokens.Select(token => token.Name).ShouldContain("primary");
    [Fact] void should_take_the_profile_from_the_screenplay() => _context.Catalogue.Profile!.Name.ShouldEqual("Desktop");
    [Fact] void should_keep_what_the_host_gave() => _context.Catalogue.Descriptors.Count.ShouldEqual(Shop.Catalogue().Descriptors.Count);
    [Fact] void should_keep_the_screenplay() => _context.Screenplay.ShouldEqual(Shop.Screenplay);
    [Fact] void should_keep_the_version() => _context.DesignSystemVersion.ShouldEqual("v7");
    [Fact] void should_keep_the_notes() => _context.Notes.ShouldEqual("For the invoicing slice");
}
