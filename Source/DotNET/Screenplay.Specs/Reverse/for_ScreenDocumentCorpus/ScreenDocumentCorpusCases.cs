// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Screenplay.Reverse.given;

namespace Cratis.Scene.Screenplay.Reverse.for_ScreenDocumentCorpus;

// The .play sources the corpus is built from: one per shape of screen a model writes, so a change to either
// bridge is caught by the case that covers the shape it changed.
public static class ScreenDocumentCorpusCases
{
    const string CaseAScreenOfContentDirectives = """
            module Sales
              feature Orders
                slice StateView OrderList
                  readmodel OrderRow
                    id Uuid
                    customer String
                    total Decimal

                  query AllOrders => observable OrderRow[]

                  projection OrderRowProjection => OrderRow
                    from OrderPlaced
                      id = $eventSourceId

                  screen Orders
                    title "Orders"
                    data OrderRow[] via query AllOrders
                    table OrderRow
                      column customer label "Customer"
                      column total
            """;

    const string CaseAScreenOfASummary = """
            module Sales
              feature Orders
                slice StateView OrderDetail
                  readmodel OrderDetailRow
                    id Uuid
                    customer String

                  query OrderById => OrderDetailRow optional
                    by id Uuid

                  projection OrderDetailRowProjection => OrderDetailRow
                    from OrderPlaced
                      id = $eventSourceId

                  screen OrderDetail
                    title "Order"
                    data OrderDetailRow via query OrderById by id
                    summary OrderDetailRow
                      field customer label "Customer"
            """;

    const string CaseAScreenThatFillsABlueprintTemplate = """
            module Sales
              feature Orders
                slice StateView OrderList
                  readmodel OrderRow
                    id Uuid
                    customer String

                  query AllOrders => observable OrderRow[]

                  projection OrderRowProjection => OrderRow
                    from OrderPlaced
                      id = $eventSourceId

                  screen Orders
                    template blueprint Cratis.Blueprint.Default ListScreen version "^1"
                      header
                        component Cratis.Blueprint.Default.pageHeader ordersHeader
                          property title = "Orders"
                          property subtitle = "What has been ordered"
                      list
                        data OrderRow[] via query AllOrders
                        table OrderRow
                          column customer label "Customer"
            """;

    const string CaseAScreenWithAToolbarOfButtons = """
            module Sales
              form PlaceOrderForm for PlaceOrder
                field customer label "Customer"

              feature Orders
                slice StateChange PlaceOrder
                  command PlaceOrder
                    id Uuid identifier
                    customer String
                    produces OrderPlaced
                      for id
                      customer = customer
                  event OrderPlaced
                    customer String

                  screen PlaceOrder
                    title "Place an order"
                    action PlaceOrder

                slice StateView OrderList
                  readmodel OrderRow
                    id Uuid

                  query AllOrders => observable OrderRow[]

                  projection OrderRowProjection => OrderRow
                    from OrderPlaced
                      id = $eventSourceId

                  screen Orders
                    data OrderRow[] via query AllOrders
                    toolbar actions
                      button new title "New order" slice Sales.Orders.PlaceOrder emphasis primary icon plus
            """;

    const string CaseAScreenOfAComponentWithPropertiesAndASection = """
            module Sales
              feature Orders
                slice StateView OrderBoard
                  readmodel OrderRow
                    id Uuid
                    customer String

                  query AllOrders => observable OrderRow[]

                  projection OrderRowProjection => OrderRow
                    from OrderPlaced
                      id = $eventSourceId

                  screen OrderBoard
                    section summary
                      component Cratis.Blueprint.Default.pageHeader boardHeader
                        property title = "Board"
                        property dense = true
                        property columns = 3
                      component Cratis.Components.card boardCard
                        property name = "Board card"
                        property body from customer
            """;

    const string CaseAScreenOfASliceThatHasACommandForm = """
            module Sales
              form PlaceOrderForm for PlaceOrder
                field customer label "Customer"

              feature Orders
                slice StateChange PlaceOrder
                  command PlaceOrder
                    id Uuid identifier
                    customer String
                    produces OrderPlaced
                      for id
                      customer = customer
                  event OrderPlaced
                    customer String

                  screen PlaceOrder
                    title "Place an order"
                    action PlaceOrder
            """;

    const string CaseScreensOfSeveralRolesAndAScreenOfItsOwn = """
            persona Buyer
              description "Buys things"

            persona Seller
              description "Sells things"

            module Sales
              feature Orders
                slice StateView OrderList
                  readmodel OrderRow
                    id Uuid
                    customer String

                  query AllOrders => observable OrderRow[]

                  projection OrderRowProjection => OrderRow
                    from OrderPlaced
                      id = $eventSourceId

                  screen Buyer
                    title "What you ordered"
                    data OrderRow[] via query AllOrders

                  screen Buyer__History
                    title "Earlier orders"

                  screen Seller
                    title "What was ordered from you"

                  screen OrderPrintout
                    title "Printout"
            """;

    const string CaseAScreenStatingSomethingTheMirrorCannotDraw = """
            module Sales
              feature Orders
                slice StateView OrderList
                  readmodel OrderRow
                    id Uuid
                    customer String

                  query AllOrders => observable OrderRow[]

                  projection OrderRowProjection => OrderRow
                    from OrderPlaced
                      id = $eventSourceId

                  screen Orders
                    title "Orders"
                    data OrderRow[] via query AllOrders
                    table OrderRow
                      column customer label "Customer"
                      on double click
                        navigate to OrderDetail
                  screen OrderDetail
                    title "Order"
            """;

    public static readonly IReadOnlyList<ScreenDocumentCorpusCase> All =
    [
        new("a screen of content directives", CaseAScreenOfContentDirectives),
        new("a screen of a summary", CaseAScreenOfASummary),
        new("a screen that fills a blueprint template", CaseAScreenThatFillsABlueprintTemplate),
        new("a screen with a toolbar of buttons", CaseAScreenWithAToolbarOfButtons),
        new("a screen of a component with properties and a section", CaseAScreenOfAComponentWithPropertiesAndASection),
        new("a screen of a slice that has a command form", CaseAScreenOfASliceThatHasACommandForm),
        new("screens of several roles and a screen of its own", CaseScreensOfSeveralRolesAndAScreenOfItsOwn),
        new("a screen stating something the mirror cannot draw", CaseAScreenStatingSomethingTheMirrorCannotDraw),
    ];

    // A screen Studio exported whose design typed Screenplay cannot say travels as the exact document on the
    // preservation carrier. Printed by the bridge itself rather than written here, because the carrier's shape -
    // which directive, which encoding - is the bridge's own and must stay the thing the mirror reads.
    public static IEnumerable<ScreenDocumentCorpusCase> Printed()
    {
        (string ActorId, string Role, string Document)[] onePreserved =
        [
            ("buyer", "Buyer", PreservedDocument)
        ];
        yield return new("a screen that carries the document Studio saved", DocumentTransport.Export(onePreserved).Source);

        (string ActorId, string Role, string Document)[] oneOfTwoPreserved =
        [
            ("buyer", "Buyer", PreservedDocument),
            ("seller", "Seller", TypedDocument)
        ];
        yield return new("two roles, one of them carrying its document", DocumentTransport.Export(oneOfTwoPreserved).Source);
    }

    // A document with a member no typed Screenplay screen can say, so the bridge preserves it whole.
    const string PreservedDocument = """
        {"layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[],
         "screens":[{"name":"Screen","layout":"StudioScreen","slotContent":{"content":[]},"forms":[],"contributions":[],"somethingScreenplayCannotSay":true}],
         "exposures":[],"instanceContributions":[]}
        """;

    // A document that travels typed, so the same .play holds both a carried screen and a converted one.
    const string TypedDocument = """
        {"layouts":[{"name":"StudioScreen","slots":[{"name":"content"}]}],"screenTemplates":[],"dialogTemplates":[],
         "screens":[{"name":"Screen","layout":"StudioScreen","slotContent":{"content":[{"id":"seller-panel","name":"Seller panel","componentName":"core:sellerPanel","properties":{"title":"Seller"},"slots":{}}]},"forms":[],"contributions":[]}],
         "exposures":[],"instanceContributions":[]}
        """;
}
