// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Navigation.for_EffectiveNavigation;

public class when_applying_the_edit_corpus : Specification
{
    IReadOnlyList<NavigationFixtures.EditCase> _cases = null!;

    void Establish() => _cases = NavigationFixtures.LoadEditCases("navigation-inheritance-fixtures.json");

    [Fact]
    void should_carry_cases() => _cases.Count.ShouldBeGreaterThan(10);

    [Fact]
    void should_plan_the_same_edits_as_the_typescript_engine()
    {
        foreach (var fixture in _cases)
        {
            var plan = NavigationFixtures.Plan(fixture.Navigation, fixture.Call);
            if (fixture.Expected.TryGetProperty("rejected", out var rejected))
            {
                (fixture.Name, plan.Rejected, plan.Edits.Count).ShouldEqual((fixture.Name, rejected.GetString(), 0));
                continue;
            }

            (fixture.Name, plan.Rejected).ShouldEqual((fixture.Name, null));
            (fixture.Name, NavigationFixtures.Canonical(plan.Edits)).ShouldEqual((fixture.Name, NavigationFixtures.Canonical(fixture.Expected.GetProperty("edits"))));
        }
    }

    [Fact]
    void should_apply_the_planned_edits_to_the_same_model_as_the_typescript_engine()
    {
        foreach (var fixture in _cases.Where(fixture => !fixture.Expected.TryGetProperty("rejected", out _)))
        {
            var outcome = Cratis.Scene.Engine.Navigation.NavigationEdits.Apply(fixture.Navigation, NavigationFixtures.Plan(fixture.Navigation, fixture.Call).Edits);
            (fixture.Name, outcome.Applied).ShouldEqual((fixture.Name, true));
            (fixture.Name, NavigationFixtures.Canonical(outcome.Model)).ShouldEqual((fixture.Name, NavigationFixtures.Canonical(fixture.Expected.GetProperty("model"))));
        }
    }

    [Fact]
    void should_not_change_the_model_it_was_given()
    {
        foreach (var fixture in _cases)
        {
            var before = NavigationFixtures.Canonical(fixture.Navigation);
            NavigationEdits.Apply(fixture.Navigation, NavigationFixtures.Plan(fixture.Navigation, fixture.Call).Edits);
            (fixture.Name, NavigationFixtures.Canonical(fixture.Navigation)).ShouldEqual((fixture.Name, before));
        }
    }
}
