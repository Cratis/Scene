// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_ConflictDetector;

public class when_there_is_nothing_to_choose : Specification
{
    IReadOnlyList<DesignSystemConflict> _conflicts = null!;

    void Because() => _conflicts = ConflictDetector.Detect([Brand.File("a.css", ".a { color: #4338CA; border-radius: 8px; } .b { color: #FFFFFF; border-radius: 24px; }")]);

    [Fact] void should_find_no_conflict() => _conflicts.ShouldBeEmpty();
}
