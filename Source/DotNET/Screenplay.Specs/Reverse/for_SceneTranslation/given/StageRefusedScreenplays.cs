// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward.for_SceneTranslation.given;

// A document that compiles cleanly and still cannot be rendered by the pinned Stage, which refuses to translate it by throwing.
public static class StageRefusedScreenplays
{
    // Stage cannot compose a top-level template with another top-level screen directive.
    public const string WithMixedScreenContent = """
        module Ordering
          feature Checkout
            slice StateView Orders
              readmodel CustomerRow
                id String key
                name String
              query AllCustomers => CustomerRow[]
              screen Orders
                template OrderPage
                component core.title heading
                  id "heading"
                  property text = "Orders"
          screen template OrderPage
            slot content
        """;
}
