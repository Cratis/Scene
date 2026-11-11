// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.for_PackageDependencyResolver;
using Cratis.Scene.Engine.Packages;

namespace Cratis.Scene.Engine.for_PackageVersionRange;

public class when_validating_and_comparing_against_the_shared_fixture_corpus : Specification
{
    List<(string? Range, bool Expected, bool Actual)> _ranges = null!;
    List<(string? Version, bool Expected, bool Actual)> _versions = null!;
    List<(string Left, string Right, int Expected, int Actual)> _comparisons = null!;

    void Establish()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(PackageFixtures.FixturePath));
        var root = document.RootElement;
        _ranges =
        [
            .. root.GetProperty("versionRangeValidityCases").EnumerateArray()
                .Select(element => (Text(element, "range"), element.GetProperty("expected").GetBoolean(), false))
        ];
        _versions =
        [
            .. root.GetProperty("versionValidityCases").EnumerateArray()
                .Select(element => (Text(element, "version"), element.GetProperty("expected").GetBoolean(), false))
        ];
        _comparisons =
        [
            .. root.GetProperty("versionComparisonCases").EnumerateArray()
                .Select(element => (element.GetProperty("left").GetString()!, element.GetProperty("right").GetString()!, element.GetProperty("expected").GetInt32(), 0))
        ];
    }

    void Because()
    {
        _ranges = [.. _ranges.Select(row => (row.Range, row.Expected, PackageVersionRange.IsValidRange(row.Range)))];
        _versions = [.. _versions.Select(row => (row.Version, row.Expected, PackageVersionRange.IsValidVersion(row.Version)))];
        _comparisons = [.. _comparisons.Select(row => (row.Left, row.Right, row.Expected, Math.Sign(PackageVersionRange.CompareVersions(row.Left, row.Right))))];
    }

    [Fact]
    void should_judge_every_range_as_the_corpus_does() =>
        ((List<(string, bool)>)[.. _ranges.Select(row => ($"range '{row.Range ?? "<null>"}'", row.Actual))]).ShouldEqual([.. _ranges.Select(row => ($"range '{row.Range ?? "<null>"}'", row.Expected))]);

    [Fact]
    void should_judge_every_version_as_the_corpus_does() =>
        ((List<(string, bool)>)[.. _versions.Select(row => ($"version '{row.Version ?? "<null>"}'", row.Actual))]).ShouldEqual([.. _versions.Select(row => ($"version '{row.Version ?? "<null>"}'", row.Expected))]);

    [Fact]
    void should_order_every_pair_as_the_corpus_does() =>
        ((List<(string, int)>)[.. _comparisons.Select(row => ($"'{row.Left}' against '{row.Right}'", row.Actual))]).ShouldEqual([.. _comparisons.Select(row => ($"'{row.Left}' against '{row.Right}'", row.Expected))]);

    static string? Text(JsonElement element, string property) =>
        element.GetProperty(property).ValueKind == JsonValueKind.Null ? null : element.GetProperty(property).GetString();
}
