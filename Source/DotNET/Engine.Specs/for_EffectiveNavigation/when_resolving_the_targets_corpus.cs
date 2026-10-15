// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Structure;

namespace Cratis.Scene.Engine.Navigation.for_EffectiveNavigation;

public class when_resolving_the_targets_corpus : Specification
{
    IReadOnlyList<NavigationFixtures.Case> _cases = null!;

    void Establish() => _cases = NavigationFixtures.LoadCases("navigation-targets-fixtures.json").Cases;

    [Fact]
    void should_carry_cases() => _cases.Count.ShouldBeGreaterThan(5);

    [Fact]
    void should_resolve_every_view_as_the_typescript_engine_does()
    {
        foreach (var fixture in _cases)
        {
            var index = new ApplicationStructureIndex(fixture.Structure!);
            foreach (var view in fixture.Views)
            {
                (fixture.Name, view.Module, view.Region, NavigationFixtures.DescribeView(index, fixture.Navigation, view))
                    .ShouldEqual((fixture.Name, view.Module, view.Region, NavigationFixtures.DescribeExpected(view)));
            }
        }
    }

    [Fact]
    void should_report_the_same_diagnostics_as_the_typescript_engine()
    {
        foreach (var fixture in _cases)
        {
            var actual = NavigationRegionDiagnostics.Diagnose(new ApplicationStructureIndex(fixture.Structure!), fixture.Navigation, fixture.Slots);
            (fixture.Name, string.Join('\n', NavigationFixtures.DescribeDiagnostics(actual)))
                .ShouldEqual((fixture.Name, string.Join('\n', NavigationFixtures.DescribeExpected(fixture.ExpectedDiagnostics))));
        }
    }
}
