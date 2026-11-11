// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Engine.Navigation.for_NavigationDiagnostics;

public class when_diagnosing_a_derived_route_no_destination_authors : Specification
{
    static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter() }
    };

    IReadOnlyList<NavigationDiagnostic> _diagnostics = null!;

    void Because()
    {
        var graph = JsonSerializer.Deserialize<NavigationGraph>(
            """{"entries":[{"id":"one","destination":{"screen":"A"}},{"id":"two","destination":{"screen":"B"}}]}""",
            _options);
        _diagnostics = NavigationDiagnostics.Diagnose(graph, _ => "/shared");
    }

    [Fact]
    void should_show_the_derived_route_when_two_destinations_that_open_different_targets_claim_it() =>
        _diagnostics
            .Where(diagnostic => diagnostic.Code == NavigationDiagnosticCode.DuplicateRoute)
            .Select(diagnostic => diagnostic.Message)
            .ShouldContainOnly("Route '/shared' is used by destinations 'one' and 'two', which open different targets.");
}
