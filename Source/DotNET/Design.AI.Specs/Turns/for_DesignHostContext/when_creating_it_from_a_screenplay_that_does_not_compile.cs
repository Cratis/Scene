// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Catalogue;

namespace Cratis.Scene.Design.AI.Turns.for_DesignHostContext;

public class when_creating_it_from_a_screenplay_that_does_not_compile : Specification
{
    DesignCatalogueInput _input = null!;
    DesignHostContext _context = null!;

    void Establish() => _input = Shop.Catalogue();

    void Because() => _context = DesignHostContext.FromScreenplay(_input, "this is not screenplay at all\n  really");

    [Fact] void should_have_no_design_system_to_take() => _context.Catalogue.DesignSystem.ShouldBeNull();
    [Fact] void should_keep_the_profile_as_given() => _context.Catalogue.Profile.ShouldBeSame(_input.Profile);
}
