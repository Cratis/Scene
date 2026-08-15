// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Layouts;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.for_SizeClassCalculator;

public class when_computing_the_size_class : Specification
{
    [Fact] void should_be_compact_by_compact_below_both_breakpoints() =>
        SizeClassCalculator.Compute(320, 480).ShouldEqual(new SizeClass(WidthSizeClass.Compact, HeightSizeClass.Compact));

    [Fact] void should_be_regular_width_below_height_breakpoint_only() =>
        SizeClassCalculator.Compute(1024, 480).ShouldEqual(new SizeClass(WidthSizeClass.Regular, HeightSizeClass.Compact));

    [Fact] void should_be_regular_by_regular_at_exactly_both_breakpoints() =>
        SizeClassCalculator.Compute(SizeClassCalculator.DefaultWidthBreakpoint, SizeClassCalculator.DefaultHeightBreakpoint)
            .ShouldEqual(new SizeClass(WidthSizeClass.Regular, HeightSizeClass.Regular));

    [Fact] void should_honor_a_custom_breakpoint() =>
        SizeClassCalculator.Compute(500, 500, widthBreakpoint: 400).Width.ShouldEqual(WidthSizeClass.Regular);
}
