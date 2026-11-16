// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.ScreenSets;

namespace Cratis.Scene.Design.for_ScreenSet;

public class when_changing_the_screens : Specification
{
    ScreenSet _start = null!;
    ScreenSet _added = null!;
    ScreenSet _moved = null!;
    ScreenSet _removed = null!;
    ScreenSet _replacedDefault = null!;

    void Establish() => _start = ScreenSet.Create(["A", "B", "C"]).WithStoryline(new Storyline("Pay", ["C", "A"]));

    void Because()
    {
        _added = _start.AddScreen("X", 1);
        _moved = _start.MoveScreen("C", 0);
        _removed = _start.RemoveScreen("C");
        _replacedDefault = _start.WithStoryline(new Storyline(ScreenSet.DefaultStorylineName, ["B"]));
    }

    [Fact] void should_keep_the_default_storyline_in_screen_order_when_a_screen_is_added() => _added.Storylines[0].Steps.ToList().ShouldEqual("A", "X", "B", "C");

    [Fact] void should_keep_it_in_order_when_a_screen_is_moved() => _moved.Storylines[0].Steps.ToList().ShouldEqual("C", "A", "B");

    [Fact] void should_leave_the_storylines_of_the_author_alone_when_a_screen_is_moved() => _moved.Storylines[1].Steps.ToList().ShouldEqual("C", "A");

    [Fact] void should_take_a_removed_screen_out_of_every_storyline() => _removed.Storylines.Select(storyline => string.Join(',', storyline.Steps)).ToList().ShouldEqual("A,B", "A");

    [Fact] void should_not_let_the_default_storyline_be_replaced() => _replacedDefault.ShouldEqual(_start);
}
