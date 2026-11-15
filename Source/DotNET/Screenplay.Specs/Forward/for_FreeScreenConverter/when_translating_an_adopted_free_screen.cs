// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward.for_FreeScreenConverter;

public class when_translating_an_adopted_free_screen : given.a_translated_free_screen
{
    void Because() => Translate(Source);

    [Fact] void should_translate_one_screen_for_the_free_screen() => _result.Screens.Count(screen => screen.Name == "InvoiceList").ShouldEqual(1);
    [Fact] void should_own_it_by_the_first_adopting_slice() => Free.Owner.ShouldEqual("Invoicing.Paying.ListInvoices");
    [Fact] void should_keep_the_need_as_a_collection_of_the_shape() => Need.Properties["typeName"].ShouldEqual("Invoice");
    [Fact] void should_bind_the_need_to_the_query_of_the_first_adopter() => Need.Properties["query"].ShouldEqual("ListInvoices");
    [Fact] void should_map_the_fields_whose_names_differ() => ((IReadOnlyDictionary<string, object?>)Need.Properties[FreeScreenConverter.FieldMapProperty]!)["number"].ShouldEqual("invoiceNumber");
    [Fact] void should_carry_the_shape_contract() => ((IReadOnlyList<object>)Need.Properties[FreeScreenConverter.ShapeProperty]!).Count.ShouldEqual(3);
    [Fact] void should_carry_every_adoption() => ((IReadOnlyList<object>)Need.Properties[FreeScreenConverter.ProvisionsProperty]!).Count.ShouldEqual(2);
    [Fact] void should_list_the_adopting_slice_in_each_adoption() => ((IReadOnlyDictionary<string, object?>)((IReadOnlyList<object>)Need.Properties[FreeScreenConverter.ProvisionsProperty]!)[1])["slice"].ShouldEqual("Invoicing.Paying.ListOpenInvoices");
}
