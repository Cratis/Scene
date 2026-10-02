// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.for_IconReference;

public class when_comparing_against_the_shared_fixture_corpus : Specification
{
    List<(string Name, bool Expected, bool Actual)> _results = null!;

    void Because() =>
        _results =
        [
            .. IconReferenceFixtures.Load("equalityCases").EnumerateArray().Select(element =>
                (element.GetProperty("name").GetString()!,
                 element.GetProperty("expected").GetBoolean(),
                 IconReferenceFixtures.ToReference(element.GetProperty("left")).Equals(IconReferenceFixtures.ToReference(element.GetProperty("right")))))
        ];

    [Fact] void should_have_read_the_cases() => _results.ShouldNotBeEmpty();

    [Fact]
    void should_match_the_expected_equality_for_every_case()
    {
        foreach (var (name, expected, actual) in _results)
        {
            (name, actual).ShouldEqual((name, expected));
        }
    }
}
