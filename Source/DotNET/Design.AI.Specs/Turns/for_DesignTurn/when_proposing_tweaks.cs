// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_proposing_tweaks : a_design_turn
{
    async Task Because()
    {
        _model
            .Calls(("proposeTweaks", new { controls = new object[]
            {
                new { label = "Accent", kind = "hue", address = new { kind = "profile", key = "accent" } },
                new { label = "Corners", kind = "choice", address = new { kind = "profile", key = "corners" }, options = new[] { "Sharp", "Round" } },
                new { label = "Heading", kind = "choice", address = new { kind = "property", screen = "InvoiceList", element = "title", prop = "text" } },
            } }))
            .Calls(("proposeTweaks", new { controls = new object[]
            {
                new { label = "Accent", kind = "hue", address = new { kind = "profile", key = "accent" } },
                new { label = "Corners", kind = "choice", address = new { kind = "profile", key = "corners" }, options = new[] { "Sharp", "Round" } },
            } }))
            .Calls(("finish", new { reply = "You can move the accent and the corners." }));
        await Run(Request(Shop.Session(("InvoiceList", Shop.InvoiceList)), "Let me try different looks"));
    }

    [Fact] void should_refuse_a_control_bound_to_nothing_that_is_a_choice() => ToolAnswer("proposeTweaks", 0).ShouldContain("tweakUnresolved");
    [Fact] void should_accept_controls_bound_to_the_design() => ToolAnswer("proposeTweaks", 1).ShouldContain("\"applied\":true");
    [Fact] void should_propose_both_controls() => Events<TweaksProposed>().Single().Tweaks.Select(tweak => tweak.Label).ShouldContainOnly("Accent", "Corners");
    [Fact] void should_give_each_an_id_of_the_turn() => Events<TweaksProposed>().Single().Tweaks.ShouldEachConformTo(tweak => tweak.Id.StartsWith("turn-1/", StringComparison.Ordinal));
    [Fact] void should_change_no_screen() => Events<ScreenRevisionRecorded>().ShouldBeEmpty();
    [Fact] void should_fold_into_the_session() => DesignSessionReducer.FoldAll([.. Shop.SessionEvents(), .. _result.Events])!.Tweaks.Count.ShouldEqual(2);
}
