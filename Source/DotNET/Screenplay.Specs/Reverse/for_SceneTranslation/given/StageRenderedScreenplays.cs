// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward.for_SceneTranslation.given;

// A document using a UI construct earlier Stage releases left out of the scene they emitted and the pinned Stage now carries.
public static class StageRenderedScreenplays
{
    public const string WithAScreenContribution = """
        layout Shell
          category application
          navigation
          content
          outlet Navigation of navigation in navigation

        module Ordering
          feature Checkout
            slice StateView Orders
              screen Orders
                component core.title heading
                  id "heading"
                  property text = "Orders"
                contribute to Navigation order 1
                  component core.link toOrders
                    id "to-orders"
                    property label = "Orders"
        """;
}
