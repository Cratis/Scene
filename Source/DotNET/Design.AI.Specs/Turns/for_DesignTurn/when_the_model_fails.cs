// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_the_model_fails : a_design_turn
{
    async Task Because()
    {
        _model.Fails(new InvalidOperationException("no provider is available"));
        await Run(Request(Shop.Session(), "Make a list of invoices"));
    }

    [Fact] void should_not_succeed() => _result.Succeeded.ShouldBeFalse();
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_say_why() => _result.Reply.ShouldContain("no provider is available");
}
