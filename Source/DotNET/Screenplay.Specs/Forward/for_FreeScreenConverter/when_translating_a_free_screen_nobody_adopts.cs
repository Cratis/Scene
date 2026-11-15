// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward.for_FreeScreenConverter;

public class when_translating_a_free_screen_nobody_adopts : given.a_translated_free_screen
{
    void Because() => Translate(Source[..Source.IndexOf("module Invoicing", StringComparison.Ordinal)]);

    [Fact] void should_still_translate_the_screen() => Free.Name.ShouldEqual("InvoiceList");
    [Fact] void should_own_it_by_no_slice() => Free.Owner.ShouldBeNull();
    [Fact] void should_leave_the_need_unbound() => Need.Properties.ContainsKey("query").ShouldBeFalse();
    [Fact] void should_keep_the_shape_contract() => ((IReadOnlyList<object>)Need.Properties[FreeScreenConverter.ShapeProperty]!).Count.ShouldEqual(3);
    [Fact] void should_carry_no_adoption() => Need.Properties.ContainsKey(FreeScreenConverter.ProvisionsProperty).ShouldBeFalse();
}
