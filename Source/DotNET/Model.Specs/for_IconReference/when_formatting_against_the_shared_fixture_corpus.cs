// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.for_IconReference;

public class when_formatting_against_the_shared_fixture_corpus : Specification
{
    List<(string Name, string Expected, string Actual)> _results = null!;

    void Because() =>
        _results =
        [
            .. IconReferenceFixtures.Load("formatCases").EnumerateArray().Select(element =>
                (element.GetProperty("name").GetString()!,
                 element.GetProperty("expected").GetString()!,
                 IconReferenceFixtures.ToReference(element.GetProperty("reference")).Format()))
        ];

    [Fact] void should_have_read_the_cases() => _results.ShouldNotBeEmpty();

    [Fact]
    void should_produce_the_expected_text_for_every_case()
    {
        foreach (var (name, expected, actual) in _results)
        {
            (name, actual).ShouldEqual((name, expected));
        }
    }
}
