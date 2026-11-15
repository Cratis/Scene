// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Screenplay;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.RoundTrip.for_ScreenplaySceneRoundTrip;

public class when_round_tripping_free_screens : given.a_round_tripped_screenplay
{
    void Because() => RoundTrip(given.Applications.Design + "\n" + given.Applications.Shell + "\n" + given.Applications.Screens);

    SliceSyntax Adopter(ApplicationSyntax application) => Slices(application).Single(slice => slice.Name == "ListInvoices");

    [Fact] void should_bring_back_the_free_screen_as_it_was() => Printed(screens: _returned.Screens).ShouldEqual(Printed(screens: _original.Screens));
    [Fact] void should_bring_back_the_shape_as_it_was() => Printed(shapes: _returned.Shapes).ShouldEqual(Printed(shapes: _original.Shapes));
    [Fact] void should_keep_the_need_a_need() => _returned.Screens.Single().Directives.OfType<ScreenNeedSyntax>().Count().ShouldEqual(1);
    [Fact] void should_bring_back_the_slice_that_adopts_it() => Adopter(_returned).UsedScreens.Single().Screen.ShouldEqual("InvoiceList");
    [Fact] void should_bring_back_what_the_slice_provides() => Adopter(_returned).UsedScreens.Single().Provisions.Single().Query.ShouldEqual("ListInvoices");
    [Fact] void should_bring_back_the_field_mapping() => $"{Adopter(_returned).UsedScreens.Single().Provisions.Single().Mappings.Single().Field}={Adopter(_returned).UsedScreens.Single().Provisions.Single().Mappings.Single().Path}".ShouldEqual("number=invoiceNumber");
    [Fact] void should_bring_back_the_provision_as_the_model_said_it() => Adopter(_returned).UsedScreens.Single().Provisions.Single().Need.ShouldEqual("Invoice");
    [Fact] void should_declare_where_the_adopting_slice_lives() => _returned.Modules.Single(module => module.Name == "Sales").Features.Single(feature => feature.Name == "Billing").Slices.Single().Name.ShouldEqual("ListInvoices");
    [Fact] void should_give_the_adopting_slice_a_query_that_provides_the_shape() => Adopter(_returned).Queries.Single().Name.ShouldEqual("ListInvoices");
    [Fact] void should_compile_without_an_error() => new ScreenplayCompiler().Parse(_printed.Source).Diagnostics.ShouldNotContain(diagnostic => diagnostic.Severity == Cratis.Screenplay.Diagnostics.DiagnosticSeverity.Error);
    [Fact] void should_not_differ_under_model_comparison() => Compare(Printed(shapes: _original.Shapes, screens: _original.Screens), Printed(shapes: _returned.Shapes, screens: _returned.Screens)).Declarations.ShouldBeEmpty();
}
