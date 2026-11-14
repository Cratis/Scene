// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Collections;
using Cratis.Scene.Model.Navigation;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Navigation.for_EffectiveNavigation;

public class when_serializing_navigation_edits : Specification
{
    NavigationFixtures.Characterization _corpus = null!;

    void Establish() => _corpus = NavigationFixtures.LoadCharacterization("navigation-inheritance-fixtures.json");

    static OutletNavigationItem Item(string id, params OutletItem[] children) => new() { Id = id, Title = id.ToUpperInvariant(), Children = children.Length == 0 ? null : children.Cast<OutletNavigationItem>().ToList() };

    static NavigationModel Declaring(params Outlet[] outlets) => new(new ApplicationNavigation(outlets), []);

    [Fact]
    void should_refuse_a_sub_item_of_a_flat_outlet_without_reading_the_items_of_the_level()
    {
        var navigation = Declaring(new Outlet("topbar", OutletKind.Navigation, new UnreadableItems()));

        var plan = NavigationEdits.AddItem(navigation, null, "topbar", Item("x"), parent: "a");

        (plan.Rejected, plan.Edits.Count).ShouldEqual(("The topbar is flat; its items have no sub-items.", 0));
    }

    [Fact]
    void should_serialize_a_plan_with_the_property_order_the_edits_declare()
    {
        var navigation = _corpus.Navigation;
        var plan = NavigationEdits.AddItem(navigation, "plain", "sidebar", Item("n"), index: 1);
        NavigationFixtures.Raw(plan.Edits).ShouldEqual(NavigationFixtures.RawGolden("plan"));
    }

    [Fact]
    void should_serialize_an_applied_model_with_the_property_order_the_model_declares()
    {
        var outcome = NavigationEdits.Apply(Declaring(new Outlet("sidebar", OutletKind.Navigation, [Item("a")])), [new NavigationEdit(NavigationEditKind.AddItem, null, "sidebar", Parent: "a", Item: Item("c"))]);
        NavigationFixtures.Raw(outcome.Model).ShouldEqual(NavigationFixtures.RawGolden("apply"));
    }

    sealed class UnreadableItems : IReadOnlyList<OutletItem>
    {
        public OutletItem this[int index] => throw new InvalidOperationException("The items were read.");

        public int Count => throw new InvalidOperationException("The items were read.");

        public IEnumerator<OutletItem> GetEnumerator() => throw new InvalidOperationException("The items were read.");

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
