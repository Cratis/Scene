// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// What a Scene document holds that typed Screenplay cannot say. Every entry names the member, so the author can see
/// exactly which part of the screen keeps the document on its preservation carrier.
/// </summary>
public sealed class SceneTransportGaps
{
    readonly List<string> _messages = [];

    public IReadOnlyList<string> Messages => _messages;

    public bool Any => _messages.Count > 0;

    public void Add(string message)
    {
        if (!_messages.Contains(message, StringComparer.Ordinal))
        {
            _messages.Add(message);
        }
    }

    public void Member(string owner, string member, string reason) =>
        Add($"Scene {owner} member '{member}' cannot travel as typed Screenplay: {reason}.");

    public void UnknownMembers(JsonObject node, string owner, IEnumerable<string> known)
    {
        foreach (var member in SceneJson.UnknownMembers(node, known))
        {
            Member(owner, member, $"Screenplay {ScreenplayVersion.Current} has no counterpart for it");
        }
    }
}
