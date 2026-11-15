// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;
using Microsoft.Extensions.AI;

namespace Cratis.Scene.Design.AI.Turns.for_DesignTurn;

public class when_not_given_an_image : a_design_turn
{
    async Task Because()
    {
        _model.Calls(("finish", new { reply = "Nothing to change." }));
        await Run(Request(Shop.Session(), "Is there anything to do?"));
    }

    [Fact] void should_not_send_an_image() => _model.Requests[0].SelectMany(message => message.Contents).OfType<DataContent>().ShouldBeEmpty();
    [Fact] void should_not_tell_the_model_about_images() => _model.Requests[0][0].Text.ShouldNotContain("## Images");
    [Fact] void should_tell_the_model_the_rules() => _model.Requests[0][0].Text.ShouldContain("freeStylingNotAllowed");
    [Fact] void should_change_nothing() => _result.Events.ShouldBeEmpty();
    [Fact] void should_say_so() => _result.Reply.ShouldEqual("Nothing to change.");
}
