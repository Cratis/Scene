// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.ContributionPoints;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Model.for_Screen;

public class when_composing_a_screen_with_a_flow_and_freeform_layout : Specification
{
    Layout _layout = null!;
    Screen _screen = null!;
    ExternalComponent _title = null!;
    ExternalComponent _summaryWidget = null!;

    void Establish()
    {
        _title = new ExternalComponent { Id = "title", Name = "title", ComponentName = "core:text" };
        _summaryWidget = new ExternalComponent { Id = "summary", Name = "summary", ComponentName = "core:card" };

        _layout = new Layout(
            "dashboard",
            [
                new Slot("header", new FlowArrangement(new FlowRow { Children = [new FlowLeaf(_title)] })),
                new Slot(
                    "widgets",
                    new FreeformArrangement(
                    [
                        new FreeformVariant(
                            new SizeClass(WidthSizeClass.Compact, HeightSizeClass.Regular),
                            [new ElementPlacement(_summaryWidget, 0, 0, 320, 180)]),
                        new FreeformVariant(
                            new SizeClass(WidthSizeClass.Regular, HeightSizeClass.Regular),
                            [new ElementPlacement(_summaryWidget, 16, 16, 480, 240)])
                    ]))
            ]);

        _screen = new Screen(
            "Dashboard",
            _layout.Name,
            new Dictionary<string, IReadOnlyList<Element>>
            {
                ["header"] = [_title],
                ["widgets"] = [_summaryWidget]
            },
            [],
            [new Contribution("Navigation", new ExternalComponent { Id = "nav-item", Name = "nav-item", ComponentName = "core:navigation-item" })]);
    }

    [Fact] void should_reference_the_layout_by_name() => _screen.Layout.ShouldEqual(_layout.Name);
    [Fact] void should_have_two_slots() => _layout.Slots.Count.ShouldEqual(2);
    [Fact] void should_use_flow_arrangement_for_the_header_slot() => _layout.Slots[0].Arrangement.ShouldBeOfExactType<FlowArrangement>();
    [Fact] void should_use_freeform_arrangement_for_the_widgets_slot() => _layout.Slots[1].Arrangement.ShouldBeOfExactType<FreeformArrangement>();
    [Fact] void should_have_a_freeform_variant_per_targeted_size_class() => ((FreeformArrangement)_layout.Slots[1].Arrangement!).Variants.Count.ShouldEqual(2);
    [Fact] void should_carry_one_navigation_contribution() => _screen.Contributions.Count.ShouldEqual(1);
    [Fact] void should_target_the_navigation_contribution_point() => _screen.Contributions[0].ContributionPointName.ShouldEqual("Navigation");
}
