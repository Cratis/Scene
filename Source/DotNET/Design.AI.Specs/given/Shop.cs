// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Design.AI.Turns;
using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.AI.given;

/// <summary>
/// The application the specs design screens for: a design system and its theme, a shell, a ui profile and a screen template, with a catalogue of core
/// components, a shape, two queries and a command.
/// </summary>
public static class Shop
{
    public const string Screenplay =
        """
        design system ShopDesign
          modes light, dark
          default theme Daylight

          tokens
            color
              surface    "page background"
              primary    "primary action"
              on-primary "text on a primary action"

          components
            Button
              parts text, background
              variant primary
                text       = color.on-primary
                background = color.primary

        theme Daylight
          implements ShopDesign

          palette
            indigo = "#4338CA"
            white  = "#FFFFFF"

          light
            color.surface    = palette.white
            color.primary    = palette.indigo
            color.on-primary = palette.white

          dark
            color.surface    = palette.indigo
            color.primary    = palette.white
            color.on-primary = palette.indigo

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

        module Shop
          screen template ListPage
            category List
            fits slot content
            header
            main

          screen template DetailPage
            category Detail
            fits slot content
            header
            main
            aside
        """;

    public const string InvoiceList =
        """
        shape Invoice
          number String
          amount Decimal

        screen InvoiceList
          template ListPage
            header
              title "Invoices"
            main
              data Invoice[]
              table Invoice
                column number label "Number"
                column amount
        """;

    public const string InvoiceDetails =
        """
        screen InvoiceDetails
          template DetailPage
            header
              title "Invoice"
            main
              summary Invoice
                field number label "Number"
                field amount label "Amount"
        """;

    const string Input =
        """
        {
          "descriptors": [
            {"component":"core:title","displayName":"Title","category":"Content","description":"A heading","properties":[{"path":"text","label":"Text","group":"Content","valueType":"string","constraints":{"required":true}}]},
            {"component":"core:data","displayName":"Data","category":"Data","description":"The data a screen shows","properties":[{"path":"typeName","label":"Type","group":"Content","valueType":"string"}]},
            {"component":"core:table","displayName":"Table","category":"Data","description":"A table of the data","properties":[{"path":"typeName","label":"Type","group":"Content","valueType":"string"}]},
            {"component":"core:column","displayName":"Column","category":"Data","description":"A column of a table","properties":[{"path":"property","label":"Property","group":"Content","valueType":"string"},{"path":"label","label":"Label","group":"Content","valueType":"string"}]},
            {"component":"core:summary","displayName":"Summary","category":"Data","description":"The fields of one item","properties":[{"path":"typeName","label":"Type","group":"Content","valueType":"string"}]},
            {"component":"core:field","displayName":"Field","category":"Data","description":"A labelled value","properties":[{"path":"property","label":"Property","group":"Content","valueType":"string"},{"path":"label","label":"Label","group":"Content","valueType":"string"}]},
            {"component":"core:button","displayName":"Button","category":"Actions","description":"Does something when pressed","properties":[{"path":"label","label":"Label","group":"Content","valueType":"string","constraints":{"required":true}},{"path":"variant","label":"Variant","group":"Look","valueType":"enum","choices":[{"value":"primary","label":"primary"},{"value":"secondary","label":"secondary"}]},{"path":"target","label":"Target","group":"Content","valueType":"destination"}],"anatomy":{"parts":["text","background"],"variants":["primary"],"states":["hover"]}}
          ],
          "templates": [
            {"name":"ListPage","slots":[{"name":"header"},{"name":"main"}],"displayName":"List page","description":"A header and a list","metadata":{"category":"List"},"content":{}},
            {"name":"DetailPage","slots":[{"name":"header"},{"name":"main"},{"name":"aside"}],"displayName":"Detail page","description":"A header, the details and an aside","metadata":{"category":"Detail"},"content":{}}
          ],
          "outletRules": {
            "ListPage": {"header": {"components": ["core:title"], "max": 1}},
            "DetailPage": {"header": {"components": ["core:title"], "max": 1}}
          },
          "profile": {"name":"Shop","targetPlatform":"web","packages":["core"],"layout":"AppShell","theme":"Daylight","root":{"template":{"source":"Blueprint","id":"AppShell","blueprint":"core"}},"appearance":{"colorScheme":"Light","accent":"#4338CA"}},
          "shapes": [{"name":"Invoice","fields":[{"name":"number","type":"string"},{"name":"amount","type":"decimal"}]}],
          "queries": [{"id":"q1","name":"ListInvoices","origin":[],"parameters":[],"resultShape":"collection","resultFields":[{"name":"number","type":"string"},{"name":"amount","type":"decimal"}]}],
          "commands": [{"id":"c1","name":"PayInvoice","inputs":["number","amount"]}]
        }
        """;

    public static DesignCatalogueInput Catalogue() => JsonSerializer.Deserialize<DesignCatalogueInput>(Input, DesignJson.Options)!;

    public static DesignHostContext Host(string? notes = null) => DesignHostContext.FromScreenplay(Catalogue(), Screenplay, "v1", notes);

    public static DesignSession Session(params (string Screen, string Text)[] screens) => DesignSessionReducer.FoldAll(SessionEvents(screens))!;

    public static IReadOnlyList<object> SessionEvents(params (string Screen, string Text)[] screens) =>
    [
        new DesignSessionStarted("session-1", new DesignSubject(DesignSubjectKind.Application, "shop"), DesignMode.Screens, "ada", []),
        .. screens.Select(screen => new ScreenRevisionRecorded($"rev-{screen.Screen}", screen.Screen, screen.Text, [], "ada"))
    ];
}
