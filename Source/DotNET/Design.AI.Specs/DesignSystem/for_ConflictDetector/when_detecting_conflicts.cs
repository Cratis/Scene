// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_ConflictDetector;

public class when_detecting_conflicts : Specification
{
    IReadOnlyList<DesignSystemConflict> _conflicts = null!;

    void Because() => _conflicts = ConflictDetector.Detect(
    [
        Brand.File("a.css", ".a { color: #4338CA; border-radius: 8px; } .b { color: #4338ca; } .c { color: #FFFFFF; border-radius: 40px; }"),
        Brand.File("b.css", ".d { color: #4439CB; border-radius: 6px; } .e { color: #4338CA; } .f { color: #fff; }"),
        new(DesignSourceKind.RunningApp, "the running app", "capture", Image: new byte[] { 1 }),
    ]);

    DesignSystemConflict Color => _conflicts.Single(conflict => conflict.Kind == DesignSystemConflictKind.Color);

    DesignSystemConflict Corner => _conflicts.Single(conflict => conflict.Kind == DesignSystemConflictKind.Corner);

    [Fact] void should_find_one_conflict_of_colors() => _conflicts.Count(conflict => conflict.Kind == DesignSystemConflictKind.Color).ShouldEqual(1);
    [Fact] void should_find_one_conflict_of_corners() => _conflicts.Count(conflict => conflict.Kind == DesignSystemConflictKind.Corner).ShouldEqual(1);
    [Fact] void should_not_find_a_conflict_in_the_same_color_written_twice() => Color.Options.Select(option => option.Value).ShouldContainOnly("#4338ca", "#4439cb");
    [Fact] void should_count_how_often_each_is_used_across_the_sources() => Color.Options[0].Count.ShouldEqual(3);
    [Fact] void should_list_the_most_used_first() => Color.Options[0].Value.ShouldEqual("#4338ca");
    [Fact] void should_say_where_a_value_is_used() => Color.Options[0].Places.Select(place => place.Source).ShouldContainOnly("shop-web: a.css", "shop-web: b.css");
    [Fact] void should_say_how_often_a_file_uses_it() => Color.Options[0].Places.Single(place => place.Source == "shop-web: a.css").Count.ShouldEqual(2);
    [Fact] void should_treat_a_three_digit_color_as_the_color_it_is() => _conflicts.SelectMany(conflict => conflict.Options).Select(option => option.Value).ShouldNotContain("#ffffff");
    [Fact] void should_find_corners_a_couple_of_pixels_apart() => Corner.Options.Select(option => option.Value).ShouldContainOnly("8px", "6px");
    [Fact] void should_not_find_a_conflict_in_corners_far_apart() => _conflicts.SelectMany(conflict => conflict.Options).Select(option => option.Value).ShouldNotContain("40px");
    [Fact] void should_name_the_choice() => Corner.Title.ShouldEqual("Corners: 6px or 8px?");
    [Fact] void should_give_it_an_identity_that_depends_on_the_values() => Corner.Id.ShouldEqual("corner:6px|8px");
}
