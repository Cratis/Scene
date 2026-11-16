// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Screenplay.Reverse.for_SceneNavigation.given;

namespace Cratis.Scene.Screenplay.Reverse.for_SceneOutletLevels;

// Cratis/StudioIssues#1331: a hook that opens nothing runs its command directly. Screenplay writes it as `runs` and the Scene document as `opens` none, and it is
// written again as `runs`. Screenplay refuses `runs` when an input of the command has no source (PLAY0907), so the command here takes its one input from the row.
public class when_round_tripping_a_hook_that_runs_without_opening : a_navigated_application
{
    const string Source =
        """
        layout AppShell
          category application
          content
          outlet rowActions of actions for item

        module Shop
          feature Orders
            slice StateChange SetPrice
              command SetPrice
                orderId Uuid identifier
                produces PriceSet
                  for orderId
              event PriceSet
                orderId Uuid
              screen SetPrice
                title "Set price"
                outlet rowActions extends
                  button withdraw title "Withdraw" slice Shop.Orders.Withdraw
                    runs
                    enabled when item.status == "onSale"
            slice StateChange Withdraw
              command Withdraw
                orderId Uuid identifier
                produces Withdrawn
                  for orderId
              event Withdrawn
                orderId Uuid
        """;

    JsonObject _withdraw = null!;

    void Because()
    {
        RoundTrip(Source);
        var levels = Documents.SelectMany(document => ((JsonArray?)document["outletLevels"] ?? []).OfType<JsonObject>());
        _withdraw = levels.First(level => level["kind"]!.GetValue<string>() == "screen")["refinements"]![0]!["items"]!.AsArray().OfType<JsonObject>().First(item => item["id"]!.GetValue<string>() == "withdraw");
    }

    [Fact] void should_import() { if (!Imported.Compilation.Success) throw new InvalidOperationException(string.Join('\n', Imported.Compilation.Diagnostics.Select(diagnostic => diagnostic.Code + " " + diagnostic.Message))); }
    [Fact] void should_carry_the_hook_that_opens_nothing() => _withdraw["opens"]!.GetValue<string>().ShouldEqual("none");
    [Fact] void should_export_it_as_runs() => Exported.ShouldContain("runs");
    [Fact] void should_not_export_where_it_opens() => Exported.ShouldNotContain("opens ");
    [Fact] void should_export_without_a_warning() => Warnings.ShouldBeEmpty();
    [Fact] void should_export_a_document_that_compiles() => Reopened.Compilation.Success.ShouldBeTrue();
}
