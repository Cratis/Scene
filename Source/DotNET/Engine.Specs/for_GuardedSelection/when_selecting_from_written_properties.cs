// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Guards;
using Cratis.Scene.Model.Guards;

namespace Cratis.Scene.Engine.for_GuardedSelection;

public class when_selecting_from_written_properties : Specification
{
    JsonElement _properties;
    GuardedSelection _matching = null!;
    GuardedSelection _fallback = null!;

    void Establish()
    {
        var properties = new GuardedActionProperties(
            "Close",
            [new("CloseTicket", new LogicalGuardCondition(new ComparisonGuardCondition(new("item.status"), GuardOperator.Equal, "Open"), LogicalGuardOperator.And, new ComparisonGuardCondition(new("item.amount"), GuardOperator.GreaterThan, 0)))],
            Otherwise: new(GuardedActionFallbackOutcome.Execute, "CancelTicket"));
        _properties = JsonSerializer.SerializeToElement(properties.ToProperties());
    }

    void Because()
    {
        var alternatives = _properties.GetProperty("alternatives");
        var otherwise = _properties.GetProperty("otherwise");
        _matching = GuardedSelection.SelectAction(alternatives, JsonSerializer.SerializeToElement(new { status = "Open", amount = 3 }), otherwise);
        _fallback = GuardedSelection.SelectAction(alternatives, JsonSerializer.SerializeToElement(new { status = "Closed", amount = 3 }), otherwise);
    }

    [Fact] void should_select_the_matching_alternative() => _matching.ShouldEqual(new GuardedSelection("alternative", 0));
    [Fact] void should_run_the_executing_fallback_when_nothing_matches() => _fallback.ShouldEqual(new GuardedSelection("otherwise"));
}
