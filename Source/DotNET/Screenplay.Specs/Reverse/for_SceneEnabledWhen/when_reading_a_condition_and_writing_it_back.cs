// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneEnabledWhen;

// Cratis/StudioIssues#1331: the condition after `enabled when` is Scene's to read; Studio only moves it between the text Scene stores and the condition Screenplay carries.
public class when_reading_a_condition_and_writing_it_back : Specification
{
    const string Text = "item.status == \"onSale\" and (item.stock > 0 or item.name startsWith \"A\")";

    ConditionSyntax? _condition;
    string? _written;
    ConditionSyntax? _unreadable;

    void Because()
    {
        _condition = SceneEnabledWhen.ToSyntax(Text);
        _written = _condition is null ? null : SceneEnabledWhen.Describe(_condition);
        _unreadable = SceneEnabledWhen.ToSyntax("not a condition at all");
    }

    [Fact] void should_read_the_condition() => _condition.ShouldBeOfExactType<LogicalConditionSyntax>();
    [Fact] void should_write_the_same_text() => _written.ShouldEqual(Text);
    [Fact] void should_not_read_what_scene_cannot() => _unreadable.ShouldBeNull();
}
