// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_changing_the_profile : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("applyOperations", new { operations = new object[] { new { op = "profile", key = "corners", value = "Round" } } }))
            .Calls(("finish", new { reply = "The corners are round." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Round the corners"));
    }

    [Fact] void should_succeed() => _result.Succeeded.ShouldBeTrue();
    [Fact] void should_give_the_changed_profile_to_the_host() => _result.Profile!.Appearance!.Corners.ToString().ShouldEqual("Round");
    [Fact] void should_not_change_a_screen() => Events<ScreenRevisionRecorded>().ShouldBeEmpty();
}
