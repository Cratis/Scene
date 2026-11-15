// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// What a screen contributes to a contribution point a layout or template opens - one Scene element and its order - as a
/// typed Screenplay 'contribute to' block on the screen, and back.
/// </summary>
static class SceneContributions
{
    static readonly string[] _members = ["contributionPointName", "content", "order"];

    /// <summary>
    /// A contribution's icon, presentation, group and destination have no Screenplay counterpart yet; the language owners
    /// track them as one ABI change, so they stay on the carrier with a message saying exactly that.
    /// </summary>
    static readonly string[] _notYetExpressible = ["icon", "presentation", "group", "destination"];

    public static IReadOnlyList<ScreenContributionSyntax> ToSyntax(JsonObject screen, string owner, SceneElementScope scope)
    {
        List<ScreenContributionSyntax> contributions = [];
        foreach (var node in SceneJson.Array(screen, "contributions"))
        {
            if (ToSyntax(node, owner, scope) is { } contribution)
            {
                contributions.Add(contribution);
            }
        }

        return contributions;
    }

    /// <summary>
    /// A contribution a Scene screen holds is exactly one element; any other is kept as the text it was written in.
    /// </summary>
    public static bool IsCarried(ScreenContributionSyntax contribution) =>
        contribution.Directives.Count() == 1 && SceneNative.IsTyped(contribution.Directives.First());

    public static JsonArray ToJson(IEnumerable<ScreenContributionSyntax> contributions, SceneScreenNames names) =>
        [.. contributions.Where(IsCarried).Select(contribution => ToJson(contribution, names)).OfType<JsonNode>()];

    static ScreenContributionSyntax? ToSyntax(JsonNode? node, string owner, SceneElementScope scope)
    {
        if (node is not JsonObject contribution || SceneJson.String(contribution, "contributionPointName") is not { } point || !SceneJson.IsIdentifier(point))
        {
            scope.Gaps.Add($"Scene {owner} has a contribution without a contribution point named like a Screenplay name, which cannot travel as typed Screenplay.");
            return null;
        }

        var contributionOwner = $"{owner} contribution to '{point}'";
        foreach (var member in _notYetExpressible.Where(member => contribution[member] is not null))
        {
            scope.Gaps.Member(contributionOwner, member, $"Screenplay cannot express a contribution's {member} yet");
        }

        scope.Gaps.UnknownMembers(contribution, contributionOwner, [.. _members, .. _notYetExpressible]);
        int? order = null;
        if (contribution["order"] is { } orderNode)
        {
            order = SceneJson.Integer(orderNode);
            if (order is null)
            {
                scope.Gaps.Member(contributionOwner, "order", "Screenplay orders contributions by whole numbers");
            }
        }

        if (contribution["content"] is not JsonObject content)
        {
            scope.Gaps.Member(contributionOwner, "content", "a contribution carries exactly one Scene element");
            return null;
        }

        return new ScreenContributionSyntax(point, order, SceneElements.ToDirectives(new JsonArray(content.DeepClone()), scope), SourceLocation.Start);
    }

    /// <summary>
    /// A Scene contribution holds one element; a Screenplay contribution saying anything else is named by the import warnings.
    /// </summary>
    static JsonObject? ToJson(ScreenContributionSyntax contribution, SceneScreenNames names)
    {
        if (SceneElementImport.ToElements(contribution.Directives, names) is not [JsonObject content])
        {
            return null;
        }

        var json = new JsonObject
        {
            ["contributionPointName"] = contribution.ContributionPoint,
            ["content"] = content.DeepClone()
        };

        if (contribution.Order is { } order)
        {
            json["order"] = order;
        }

        return json;
    }
}
