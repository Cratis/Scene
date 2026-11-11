// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation.for_EffectiveNavigation;

public class when_characterizing_navigation_edits : Specification
{
    NavigationFixtures.Characterization _corpus = null!;

    void Establish() => _corpus = NavigationFixtures.LoadCharacterization("navigation-inheritance-fixtures.json");

    [Fact]
    void should_carry_plan_and_apply_cases()
    {
        _corpus.PlanCases.Count.ShouldBeGreaterThan(20);
        _corpus.ApplyCases.Count.ShouldBeGreaterThan(30);
    }

    [Fact]
    void should_plan_exactly_what_the_corpus_pins()
    {
        foreach (var fixture in _corpus.PlanCases)
        {
            var navigation = fixture.Navigation ?? _corpus.Navigation;
            var plan = NavigationFixtures.Plan(navigation, fixture.Call);
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
    void should_apply_exactly_what_the_corpus_pins()
    {
        foreach (var fixture in _corpus.ApplyCases)
        {
            var navigation = fixture.Navigation ?? _corpus.Navigation;
            var outcome = NavigationEdits.Apply(navigation, fixture.Edits);
            (fixture.Name, outcome.Applied).ShouldEqual((fixture.Name, fixture.Expected.GetProperty("applied").GetBoolean()));
            if (outcome.Applied)
            {
                (fixture.Name, outcome.Rejected).ShouldEqual((fixture.Name, null));
                (fixture.Name, NavigationFixtures.Canonical(outcome.Model)).ShouldEqual((fixture.Name, NavigationFixtures.Canonical(fixture.Expected.GetProperty("model"))));
            }
            else
            {
                (fixture.Name, outcome.Rejected).ShouldEqual((fixture.Name, fixture.Expected.GetProperty("rejected").GetString()));
                (fixture.Name, NavigationFixtures.Canonical(outcome.Model)).ShouldEqual((fixture.Name, NavigationFixtures.Canonical(navigation)));
            }
        }
    }

    [Fact]
    void should_not_change_the_navigation_it_is_given()
    {
        foreach (var fixture in _corpus.ApplyCases)
        {
            var navigation = fixture.Navigation ?? _corpus.Navigation;
            var before = NavigationFixtures.Canonical(navigation);
            NavigationEdits.Apply(navigation, fixture.Edits);
            (fixture.Name, NavigationFixtures.Canonical(navigation)).ShouldEqual((fixture.Name, before));
        }
    }

    [Fact]
    void should_refuse_an_edit_kind_that_is_not_a_navigation_edit()
    {
        var outcome = NavigationEdits.Apply(_corpus.Navigation, [new NavigationEdit((NavigationEditKind)99, Outlet: "sidebar")]);
        (outcome.Applied, outcome.Rejected).ShouldEqual((false, "'99' is not a navigation edit."));
    }

    [Fact]
    void should_check_the_kind_before_the_outlet()
    {
        var outcome = NavigationEdits.Apply(_corpus.Navigation, [new NavigationEdit((NavigationEditKind)99)]);
        (outcome.Applied, outcome.Rejected).ShouldEqual((false, "'99' is not a navigation edit."));
    }

    [Fact]
    void should_refuse_an_item_of_a_kind_that_is_named_in_the_message_in_camel_case()
    {
        var outcome = NavigationEdits.Apply(_corpus.Navigation, [new NavigationEdit(NavigationEditKind.AddItem, Outlet: "sidebar", Item: new OutletMenuEntry { Id = "m", Title = "M" })]);
        (outcome.Applied, outcome.Rejected).ShouldEqual((false, "The outlet 'sidebar' lists navigation and does not take a menuEntry item."));
    }
}
