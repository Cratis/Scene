// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_the_model_never_finishes : a_design_turn
{
    async Task Because()
    {
        _options.MaximumIterations = 3;
        for (var index = 0; index < 6; index++)
        {
            _model.Calls(("listTemplates", new { }));
        }

        await Run(Request(Shop.Session(), "Make a list of invoices"));
    }

    [Fact] void should_not_succeed() => _result.Succeeded.ShouldBeFalse();
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_say_it_ran_out_of_steps() => _result.Reply.ShouldContain("within 3 steps");
}
