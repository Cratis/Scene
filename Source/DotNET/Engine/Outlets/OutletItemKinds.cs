// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// Which item kinds each outlet kind takes, and how messages name them.
/// </summary>
public static class OutletItemKinds
{
    /// <summary>
    /// The item kinds a group of actions holds.
    /// </summary>
    public static readonly IReadOnlyList<OutletItemKind> InGroup = [OutletItemKind.Button, OutletItemKind.MenuEntry, OutletItemKind.Separator];

    static readonly Dictionary<OutletKind, IReadOnlyList<OutletItemKind>> _allowed = new()
    {
        [OutletKind.Actions] = [OutletItemKind.Button, OutletItemKind.MenuEntry, OutletItemKind.Separator, OutletItemKind.Group],
        [OutletKind.Filters] = [OutletItemKind.Filter],
        [OutletKind.Tabs] = [OutletItemKind.Tab],
        [OutletKind.Stats] = [OutletItemKind.Stat],
        [OutletKind.Navigation] = [OutletItemKind.Navigation],
    };

    static readonly Dictionary<OutletKind, string> _descriptions = new()
    {
        [OutletKind.Actions] = "buttons, menu entries, separators and groups",
        [OutletKind.Filters] = "filters",
        [OutletKind.Tabs] = "tabs",
        [OutletKind.Stats] = "stats",
        [OutletKind.Navigation] = "navigation items",
    };

    static readonly Dictionary<OutletItemKind, string> _names = new()
    {
        [OutletItemKind.Button] = "button",
        [OutletItemKind.MenuEntry] = "menu entry",
        [OutletItemKind.Separator] = "separator",
        [OutletItemKind.Group] = "group",
        [OutletItemKind.Filter] = "filter",
        [OutletItemKind.Tab] = "tab",
        [OutletItemKind.Stat] = "stat",
        [OutletItemKind.Navigation] = "navigation item",
    };

    /// <summary>
    /// The item kinds an outlet of the given kind takes.
    /// </summary>
    /// <param name="kind">The outlet kind.</param>
    /// <returns>The item kinds, in the order editors offer them.</returns>
    public static IReadOnlyList<OutletItemKind> AllowedIn(OutletKind kind) => _allowed.GetValueOrDefault(kind) ?? [];

    /// <summary>
    /// Says what an outlet of the given kind takes, for a message: "buttons, menu entries, separators and groups".
    /// </summary>
    /// <param name="kind">The outlet kind.</param>
    /// <returns>The description.</returns>
    public static string Describe(OutletKind kind) => _descriptions.GetValueOrDefault(kind) ?? "nothing";

    /// <summary>
    /// Names an item kind for a message: "menu entry", "navigation item".
    /// </summary>
    /// <param name="kind">The item kind.</param>
    /// <returns>The name.</returns>
    public static string NameOf(OutletItemKind kind) => _names.GetValueOrDefault(kind) ?? kind.ToString();

    /// <summary>
    /// Names an outlet kind the way Screenplay and the TypeScript engine write it: "actions", "navigation".
    /// </summary>
    /// <param name="kind">The outlet kind.</param>
    /// <returns>The name.</returns>
    public static string NameOf(OutletKind kind) => kind.ToString().ToLowerInvariant();
}
