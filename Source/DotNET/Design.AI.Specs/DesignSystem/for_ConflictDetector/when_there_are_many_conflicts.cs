// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_ConflictDetector;

public class when_there_are_many_conflicts : Specification
{
    IReadOnlyList<DesignSystemConflict> _conflicts = null!;

    void Because()
    {
        // Ten pairs of colors, each pair a few steps apart and far from every other pair.
        var colors = Enumerable.Range(0, 10).SelectMany(index => new[] { index * 25, (index * 25) + 3 }).Select(value => "#" + value.ToString("x2", CultureInfo.InvariantCulture) + "0000");
        _conflicts = ConflictDetector.Detect([Brand.File("a.css", string.Join(' ', colors))]);
    }

    [Fact] void should_report_no_more_than_the_most_a_person_can_decide() => _conflicts.Count.ShouldEqual(ConflictDetector.MaxPerKind);
}
