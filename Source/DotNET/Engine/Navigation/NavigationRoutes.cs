// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Common;

namespace Cratis.Scene.Engine.Navigation;

/// <summary>
/// Route comparison shared by navigation diagnostics. The engine constructs no URLs, so it only compares what
/// was authored; a renderer supplies its own route key when it derives routes.
/// </summary>
public static class NavigationRoutes
{
    /// <summary>
    /// The default route key: the authored route override, trimmed, or none.
    /// </summary>
    /// <param name="destination">The destination.</param>
    /// <returns>The key, or <see langword="null"/> when no route was authored.</returns>
    public static string? AuthoredRouteKey(DestinationReference destination)
    {
        var route = destination.Route?.Trim();
        return string.IsNullOrEmpty(route) ? null : route;
    }

    /// <summary>
    /// What a destination opens, so two destinations sharing a route only conflict when they open different things.
    /// </summary>
    /// <param name="destination">The destination.</param>
    /// <param name="kind">The destination's effective kind name.</param>
    /// <returns>A comparable target key.</returns>
    internal static string TargetOf(DestinationReference destination, string kind) =>
        string.Join('|', kind, destination.Screen ?? Identity(destination), destination.Dialog ?? string.Empty, destination.Outlet ?? string.Empty);

    static string Identity(DestinationReference destination) =>
        string.Join('.', new[] { destination.Module, destination.Feature, destination.Slice }.Where(part => !string.IsNullOrEmpty(part)));
}
