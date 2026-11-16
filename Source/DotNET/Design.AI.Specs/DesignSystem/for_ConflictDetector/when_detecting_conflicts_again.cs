// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.AI.given;

namespace Cratis.Scene.Design.AI.DesignSystem.for_ConflictDetector;

public class when_detecting_conflicts_again : Specification
{
    IReadOnlyList<DesignSystemConflict> _first = null!;
    IReadOnlyList<DesignSystemConflict> _second = null!;

    void Because()
    {
        _first = ConflictDetector.Detect([Brand.File("app.css", Brand.Stylesheet)]);
        _second = ConflictDetector.Detect([Brand.File("other.css", "." + Brand.Stylesheet)]);
    }

    [Fact] void should_find_the_same_conflicts_with_the_same_identities() => _second.Select(conflict => conflict.Id).ShouldContainOnly(_first.Select(conflict => conflict.Id).ToArray());
}
