// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_the_design_does_not_compile : a_design_turn
{
    async Task Because() => await Run(Request(Shop.Session(("Broken", "screen Broken\n  bogus nonsense here")), "Fix it"));

    [Fact] void should_not_succeed() => _result.Succeeded.ShouldBeFalse();
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_say_the_design_does_not_compile() => _result.Reply.ShouldContain("does not compile");
    [Fact] void should_not_ask_the_model() => _model.Requests.ShouldBeEmpty();
}
