// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_the_profile_is_not_changed : a_design_turn
{
    async Task Because()
    {
        _model.Calls(("finish", new { reply = "Nothing to do." }));
        await Run(Request(Shop.Session(), "Anything?"));
    }

    [Fact] void should_not_give_a_profile_to_the_host() => _result.Profile.ShouldBeNull();
}
