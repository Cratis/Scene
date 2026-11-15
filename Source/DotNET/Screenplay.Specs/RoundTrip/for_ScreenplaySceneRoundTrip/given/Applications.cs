// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.RoundTrip.for_ScreenplaySceneRoundTrip.given;

/// <summary>
/// The Screenplay application the golden round trips carry: a design system and the theme that implements it, a layout, a screen template,
/// a ui profile, a screen of a role, and a free screen with its shape and the slice that adopts it.
/// </summary>
public static class Applications
{
    public const string Design =
        """
        design system ShopDesign
          modes light, dark
          default theme Daylight

          tokens
            color
              surface    "page background"
              text       "body text"
              primary    "primary action"
              on-primary "text on a primary action"
            radius
              control    "inputs and buttons"

          components
            Button
              parts text, background, radius
              variant primary
                text       = color.on-primary
                background = color.primary
                radius     = radius.control

          rules
            contrast text on background at least 4.5

        theme Daylight
          implements ShopDesign

          palette
            indigo = "#4338CA"
            white  = "#FFFFFF"
            ink    = "#111827"

          values
            radius.control = "8px"

          light
            color.surface    = palette.white
            color.text       = palette.ink
            color.primary    = palette.indigo
            color.on-primary = palette.white

          dark
            color.surface    = palette.ink
            color.text       = palette.white
            color.primary    = palette.indigo
            color.on-primary = palette.white
        """;

    public const string Shell =
        """
        layout AppShell
          category Shell
          topbar
          content
          footer

          arrangement flow
            column
              topbar height 56
              content grow
              footer height 32

        ui profile Desktop
          target platform web
          target size expanded

          packages
            core

          theme Daylight

          root template AppShell
        """;

    public const string Screens =
        """
        shape Invoice
          number String
          amount Decimal

        screen InvoiceList
          title "Invoices"
          data Invoice[]
          table Invoice
            column number label "Number"
            column amount

        module Sales
          feature Orders
            slice StateView ListOrders
              readmodel OrderRow
                orderNumber String
                amount Decimal
              query ListOrders => OrderRow[]
              screen UI
                title "Orders"
                data OrderRow[] via query ListOrders
                table OrderRow
                  column orderNumber label "Number"
                  column amount

          feature Billing
            slice StateView ListInvoices
              readmodel InvoiceRow
                invoiceNumber String
                amount Decimal
              query ListInvoices => InvoiceRow[]
              uses screen InvoiceList
                data Invoice via query ListInvoices
                  number from invoiceNumber
        """;
}
