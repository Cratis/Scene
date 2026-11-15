// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Screens;
using Cratis.Screenplay;

namespace Cratis.Scene.Screenplay.Forward.for_FreeScreenConverter.given;

/// <summary>
/// A free screen with a need, a shape and slices that adopt it, translated into Scene.
/// </summary>
public class a_translated_free_screen : Specification
{
    protected const string Source =
        """
        shape Invoice
          number String
          amount Decimal
          dueDate Date optional

        screen InvoiceList
          title "Invoices"
          data Invoice[]
          table Invoice
            column number label "Number"
            column amount

        module Invoicing
          feature Paying
            slice StateView ListInvoices
              readmodel InvoiceRow
                invoiceNumber String
                amount Decimal
                dueDate Date optional
              query ListInvoices => InvoiceRow[]
              uses screen InvoiceList
                data Invoice via query ListInvoices
                  number from invoiceNumber
            slice StateView ListOpenInvoices
              readmodel OpenInvoiceRow
                number String
                amount Decimal
                dueDate Date optional
              query ListOpen => OpenInvoiceRow[]
              uses screen InvoiceList
                data Invoice via query ListOpen
        """;

    protected SceneApplication _result = null!;

    protected Screen Free => _result.Screens.Single(screen => screen.Name == "InvoiceList");

    protected ExternalComponent Need => Descendants(Free.SlotContent.Values.SelectMany(slot => slot)).OfType<ExternalComponent>().Single(component => component.ComponentName == "core:data");

    protected void Translate(string source)
    {
        var compilation = new ScreenplayCompiler().Parse(source);
        _result = new ScreenplaySceneVisitor().Visit(compilation.Value!);
    }

    static IEnumerable<SceneElement> Descendants(IEnumerable<SceneElement> elements) =>
        elements.SelectMany(element => (IEnumerable<SceneElement>)[element, .. element is ExternalComponent component ? Descendants(component.Slots.Values.SelectMany(slot => slot)) : []]);
}
