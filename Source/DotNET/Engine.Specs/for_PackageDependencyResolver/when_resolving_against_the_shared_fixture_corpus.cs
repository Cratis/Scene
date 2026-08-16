// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Packages;

namespace Cratis.Scene.Engine.for_PackageDependencyResolver;

public class when_resolving_against_the_shared_fixture_corpus : Specification
{
    record FixtureCase(
        string Name,
        IReadOnlyList<string> Selected,
        IReadOnlyList<string> ExpectedPackages,
        IReadOnlyList<string> ExpectedAdded,
        IReadOnlyList<string> ExpectedMissing,
        IReadOnlyList<string> ExpectedVersionConflicts,
        IReadOnlyList<string> ExpectedCycles);

    List<FixtureCase> _cases = null!;
    List<(FixtureCase Case, PackageSelection Selection)> _results = null!;

    void Establish()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(PackageFixtures.FixturePath));
        _cases = [.. document.RootElement.GetProperty("resolutionCases").EnumerateArray().Select(ToFixtureCase)];
    }

    void Because() => _results = [.. _cases.Select(fixtureCase => (
        fixtureCase,
        PackageDependencyResolver.Resolve(fixtureCase.Selected, PackageFixtures.Catalog)))];

    [Fact]
    void should_order_every_case_as_the_corpus_expects() =>
        AssertEach(result => result.Selection.Packages, expected => expected.ExpectedPackages);

    [Fact]
    void should_report_the_expected_transitively_added_packages_for_every_case() =>
        AssertEach(result => result.Selection.Added, expected => expected.ExpectedAdded);

    [Fact]
    void should_report_the_expected_missing_dependencies_for_every_case() =>
        AssertEach(
            result => [.. result.Selection.Missing.Select(missing => $"{missing.Package}->{missing.DependsOn}")],
            expected => expected.ExpectedMissing);

    [Fact]
    void should_report_the_expected_version_conflicts_for_every_case() =>
        AssertEach(
            result => [.. result.Selection.VersionConflicts.Select(conflict => $"{conflict.Package}->{conflict.DependsOn}@{conflict.RequiredRange}!={conflict.ActualVersion}")],
            expected => expected.ExpectedVersionConflicts);

    [Fact]
    void should_report_the_expected_cycles_for_every_case() =>
        AssertEach(
            result => [.. result.Selection.Cycles.Select(cycle => string.Join('>', cycle))],
            expected => expected.ExpectedCycles);

    [Fact]
    void should_consider_a_case_with_nothing_wrong_valid()
    {
        foreach (var (fixtureCase, selection) in _results)
        {
            var expectedValid = fixtureCase.ExpectedMissing.Count == 0 && fixtureCase.ExpectedVersionConflicts.Count == 0 && fixtureCase.ExpectedCycles.Count == 0;
            (fixtureCase.Name, selection.IsValid).ShouldEqual((fixtureCase.Name, expectedValid));
        }
    }

    void AssertEach(Func<(FixtureCase Case, PackageSelection Selection), IReadOnlyList<string>> actual, Func<FixtureCase, IReadOnlyList<string>> expected)
    {
        foreach (var result in _results)
        {
            (result.Case.Name, Flatten(actual(result))).ShouldEqual((result.Case.Name, Flatten(expected(result.Case))));
        }
    }

    static string Flatten(IReadOnlyList<string> values) => string.Join(',', values);

    static FixtureCase ToFixtureCase(JsonElement element) =>
        new(
            element.GetProperty("name").GetString()!,
            Strings(element, "selected"),
            Strings(element, "expectedPackages"),
            Strings(element, "expectedAdded"),
            [.. element.GetProperty("expectedMissing").EnumerateArray().Select(missing => $"{missing.GetProperty("package").GetString()}->{missing.GetProperty("dependsOn").GetString()}")],
            [.. element.GetProperty("expectedVersionConflicts").EnumerateArray().Select(conflict =>
                $"{conflict.GetProperty("package").GetString()}->{conflict.GetProperty("dependsOn").GetString()}@{conflict.GetProperty("requiredRange").GetString()}!={conflict.GetProperty("actualVersion").GetString()}")],
            [.. element.GetProperty("expectedCycles").EnumerateArray().Select(cycle => string.Join('>', cycle.EnumerateArray().Select(name => name.GetString()!)))]);

    static IReadOnlyList<string> Strings(JsonElement element, string property) =>
        [.. element.GetProperty(property).EnumerateArray().Select(value => value.GetString()!)];
}
