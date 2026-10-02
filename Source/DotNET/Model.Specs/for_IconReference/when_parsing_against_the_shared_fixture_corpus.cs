// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Icons;

namespace Cratis.Scene.Model.for_IconReference;

public class when_parsing_against_the_shared_fixture_corpus : Specification
{
    List<(string Name, IconReference? Expected, IconReference? Actual)> _results = null!;

    void Because() =>
        _results =
        [
            .. IconReferenceFixtures.Load("parseCases").EnumerateArray().Select(element =>
            {
                var parsed = IconReference.TryParse(element.GetProperty("text").GetString()!, out var reference);
                var expected = element.GetProperty("expected");
                return (element.GetProperty("name").GetString()!,
                    expected.ValueKind == JsonValueKind.Null ? null : IconReferenceFixtures.ToReference(expected),
                    parsed ? reference : null);
            })
        ];

    [Fact] void should_have_read_the_cases() => _results.ShouldNotBeEmpty();

    [Fact]
    void should_produce_the_expected_reference_for_every_case()
    {
        foreach (var (name, expected, actual) in _results)
        {
            (name, actual).ShouldEqual((name, expected));
        }
    }
}
