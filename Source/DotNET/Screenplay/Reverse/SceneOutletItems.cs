// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Screenplay.Diagnostics;
using Cratis.Screenplay.Syntax;

namespace Cratis.Scene.Screenplay.Reverse;

/// <summary>
/// The items of a Scene outlet - buttons, groups, filters, tabs, stats and navigation items - as typed Screenplay outlet items, and back
/// (Scene 5, Screenplay 6). What typed Screenplay cannot say is named in the gaps, so the document is kept exactly rather than losing it.
/// </summary>
static class SceneOutletItems
{
    const string Button = "button";
    const string Group = "group";
    const string Filter = "filter";
    const string Tab = "tab";
    const string Stat = "stat";
    const string Navigation = "navigation";

    static readonly string[] _positionMembers = ["kind", "id", "before", "after"];
    static readonly string[] _buttonMembers = [.. _positionMembers, "title", "slice", "emphasis", "icon", SceneNavigationIcons.SourceMember, "authorize", "confirm", "opens", "opensIn", "subject", "enabledWhen"];
    static readonly string[] _groupMembers = [.. _positionMembers, "title", "icon", SceneNavigationIcons.SourceMember, "items"];
    static readonly string[] _filterMembers = [.. _positionMembers, "title", "sets"];
    static readonly string[] _tabMembers = [.. _positionMembers, "title", "shows"];
    static readonly string[] _statMembers = [.. _positionMembers, "title", "valueFrom"];
    static readonly string[] _navigationMembers = [.. _positionMembers, "title", "icon", SceneNavigationIcons.SourceMember, "target", "slot", "children"];
    static readonly string[] _targetMembers = ["module", "feature"];
    static readonly string[] _emphasisNames = ["primary", "secondary", "quiet"];
    static readonly string[] _opensNames = ["none", "dialog", "drawer", "slot"];
    static readonly string[] _subjectNames = ["item", "screen"];

    public static IReadOnlyList<OutletItemSyntax> ToSyntax(IEnumerable<JsonNode?> items, string owner, SceneTransportGaps gaps, bool asDefaults = false) =>
        [.. items.OfType<JsonObject>().Select(item => ToSyntax(item, owner, gaps)).OfType<OutletItemSyntax>().Select(item => asDefaults ? item with { IsDefault = true } : item)];

    public static OutletItemSyntax? ToSyntax(JsonObject item, string owner, SceneTransportGaps gaps)
    {
        var kind = SceneJson.String(item, "kind");
        if (SceneJson.String(item, "id") is not { } id || !SceneJson.IsIdentifier(id))
        {
            gaps.Member($"{owner} item", "id", "an item is named by a Screenplay name");
            return null;
        }

        var scope = $"{owner} {kind ?? "item"} '{id}'";
        if (SceneJson.String(item, "title") is not { Length: > 0 } title || Unquotable(title))
        {
            gaps.Member(scope, "title", "an item has a one-line title without quotes");
            return null;
        }

        OutletItemSyntax? converted = kind switch
        {
            Button => ToButton(item, id, title, scope, gaps),
            Group => ToGroup(item, id, title, scope, gaps),
            Filter => ToFilter(item, id, title, scope, gaps),
            Tab => ToTab(item, id, title, scope, gaps),
            Stat => ToStat(item, id, title, scope, gaps),
            Navigation => ToNavigationItem(item, id, title, scope, gaps),
            _ => null
        };

        if (converted is null)
        {
            if (kind is not (Button or Group or Filter or Tab or Stat or Navigation))
            {
                gaps.Member(scope, "kind", "Studio carries buttons, groups, filters, tabs, stats and navigation items into Screenplay");
            }

            return null;
        }

        return converted with { Position = Position(item, scope, gaps) };
    }

    public static JsonArray ToJson(IEnumerable<OutletItemSyntax> items) =>
        [with([.. items.Select(item => (JsonNode)ToJson(item))])];

    public static JsonObject ToJson(OutletItemSyntax item)
    {
        var json = item switch
        {
            ToolbarButtonSyntax button => ButtonJson(button),
            OutletGroupSyntax group => GroupJson(group),
            OutletFilterSyntax filter => FilterJson(filter),
            OutletTabSyntax tab => TabJson(tab),
            OutletStatSyntax stat => StatJson(stat),
            NavigationItemSyntax navigation => NavigationJson(navigation),
            _ => new JsonObject { ["kind"] = Button, ["id"] = item.Id, ["title"] = item.Title }
        };

        if (item.Position is { } position)
        {
            json[position.Placement == OutletPlacement.Before ? "before" : "after"] = position.Id;
        }

        return json;
    }

    public static bool Unquotable(string text) => text.Contains('\n', StringComparison.Ordinal) || text.Contains('"', StringComparison.Ordinal);

    static OutletPositionSyntax? Position(JsonObject item, string scope, SceneTransportGaps gaps)
    {
        var before = SceneJson.String(item, "before");
        var after = SceneJson.String(item, "after");
        if (before is not null && after is not null)
        {
            gaps.Member(scope, "after", "an item is placed before or after one other item, not both");
            return null;
        }

        if ((before ?? after) is not { } id)
        {
            return null;
        }

        if (!SceneJson.IsIdentifier(id))
        {
            gaps.Member(scope, before is null ? "after" : "before", "an item is placed relative to an item named by a Screenplay name");
            return null;
        }

        return new OutletPositionSyntax(before is null ? OutletPlacement.After : OutletPlacement.Before, id, SourceLocation.Start);
    }

    static ToolbarButtonSyntax? ToButton(JsonObject button, string id, string title, string scope, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(button, scope, _buttonMembers);
        var slice = SceneJson.String(button, "slice");
        if (SceneJson.Has(button, "slice") && (slice is null || !SceneJson.IsPath(slice)))
        {
            gaps.Member(scope, "slice", "a slice is named by its path of names");
            slice = null;
        }

        ToolbarEmphasis? emphasis = null;
        if (SceneJson.Has(button, "emphasis"))
        {
            emphasis = SceneJson.Index(SceneJson.Member(button, "emphasis"), _emphasisNames) is { } index ? (ToolbarEmphasis)index : null;
            if (emphasis is null)
            {
                gaps.Member(scope, "emphasis", "an emphasis is primary, secondary or quiet");
            }
        }

        var icon = SceneNavigationIcons.Read(button);
        if (SceneJson.Has(button, "icon") && icon is null)
        {
            gaps.Member(scope, "icon", "an icon is named by text");
        }

        AuthorizeSyntax? authorize = null;
        if (SceneJson.Has(button, "authorize"))
        {
            authorize = SceneJson.String(button, "authorize") is { } expression ? ScenePolicies.Parse(expression) : null;
            if (authorize is null)
            {
                gaps.Member(scope, "authorize", "a requirement names policies, combined with and / or");
            }
        }

        var confirm = SceneJson.String(button, "confirm");
        if (confirm is not null && Unquotable(confirm))
        {
            gaps.Member(scope, "confirm", "a confirmation is one line without quotes");
            confirm = null;
        }

        var (opens, opensSlot) = Opening(button, scope, gaps);
        ScreenActionSubjectKind? subject = null;
        if (SceneJson.Has(button, "subject"))
        {
            subject = SceneJson.Index(SceneJson.Member(button, "subject"), _subjectNames) is { } subjectIndex ? (ScreenActionSubjectKind)subjectIndex : null;
            if (subject is null)
            {
                gaps.Member(scope, "subject", "a button is for an item or for the screen");
            }
        }

        ConditionSyntax? enabledWhen = null;
        if (SceneJson.Has(button, "enabledWhen"))
        {
            enabledWhen = SceneJson.String(button, "enabledWhen") is { Length: > 0 } condition ? SceneEnabledWhen.ToSyntax(condition) : null;
            if (enabledWhen is null)
            {
                gaps.Member(scope, "enabledWhen", "a condition compares what the selected item has, joined with and / or");
            }
        }

        return new ToolbarButtonSyntax(id, title, SourceLocation.Start)
        {
            Slice = slice, Emphasis = emphasis, Icon = icon, Authorize = authorize, Confirm = confirm, Opens = opens, OpensSlot = opensSlot, Subject = subject, EnabledWhen = enabledWhen
        };
    }

    /// <summary>
    /// Where the button opens its slice. Automatic is what Screenplay says by leaving it out.
    /// </summary>
    static (HookOpening? Opens, string? Slot) Opening(JsonObject button, string scope, SceneTransportGaps gaps)
    {
        if (!SceneJson.Has(button, "opens") || string.Equals(SceneJson.String(button, "opens"), "automatic", StringComparison.OrdinalIgnoreCase))
        {
            return (null, null);
        }

        if (SceneJson.Index(SceneJson.Member(button, "opens"), _opensNames) is not { } index)
        {
            gaps.Member(scope, "opens", "a button opens automatically, runs directly, or opens a dialog, a drawer or a slot");
            return (null, null);
        }

        var opens = (HookOpening)index;
        if (opens != HookOpening.Slot)
        {
            return (opens, null);
        }

        var slot = SceneJson.String(button, "opensIn");
        if (!SceneJson.IsIdentifier(slot))
        {
            gaps.Member(scope, "opensIn", "a button that opens in a slot names it by a Screenplay name");
            return (null, null);
        }

        return (opens, slot);
    }

    static OutletGroupSyntax? ToGroup(JsonObject group, string id, string title, string scope, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(group, scope, _groupMembers);
        List<ToolbarButtonSyntax> buttons = [];
        foreach (var item in SceneJson.Array(group, "items").OfType<JsonObject>())
        {
            if (ToSyntax(item, scope, gaps) is ToolbarButtonSyntax button)
            {
                buttons.Add(button);
            }
            else if (SceneJson.String(item, "kind") != Button)
            {
                gaps.Member(scope, "items", "a group holds buttons");
            }
        }

        return new OutletGroupSyntax(id, title, buttons, SourceLocation.Start) { Icon = SceneNavigationIcons.Read(group) };
    }

    static OutletFilterSyntax ToFilter(JsonObject filter, string id, string title, string scope, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(filter, scope, _filterMembers);
        var sets = SceneJson.Object(filter, "sets");
        var query = sets is null ? null : SceneJson.String(sets, "query");
        var parameter = sets is null ? null : SceneJson.String(sets, "parameter");
        if (sets is not null && (query is null || parameter is null || !SceneJson.IsPath(query) || !SceneJson.IsIdentifier(parameter)))
        {
            gaps.Member(scope, "sets", "a filter sets a parameter of a query, both named by Screenplay names");
            return new OutletFilterSyntax(id, title, SourceLocation.Start);
        }

        return new OutletFilterSyntax(id, title, SourceLocation.Start) { Query = query, Parameter = parameter };
    }

    static OutletTabSyntax ToTab(JsonObject tab, string id, string title, string scope, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(tab, scope, _tabMembers);
        var shows = SceneJson.String(tab, "shows");
        if (shows is { Length: 0 })
        {
            shows = null;
        }

        if (shows is not null && !SceneJson.IsPath(shows))
        {
            gaps.Member(scope, "shows", "a tab shows a screen named by a Screenplay name");
            shows = null;
        }

        return new OutletTabSyntax(id, title, SourceLocation.Start) { Shows = shows };
    }

    static OutletStatSyntax ToStat(JsonObject stat, string id, string title, string scope, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(stat, scope, _statMembers);
        var value = SceneJson.Object(stat, "valueFrom");
        var query = value is null ? null : SceneJson.String(value, "query");
        var field = value is null ? null : SceneJson.String(value, "field");
        if (value is not null && (query is null || field is null || !SceneJson.IsPath(query) || !SceneJson.IsPath(field)))
        {
            gaps.Member(scope, "valueFrom", "a stat takes its value from a field of a query, both named by Screenplay names");
            return new OutletStatSyntax(id, title, SourceLocation.Start);
        }

        return new OutletStatSyntax(id, title, SourceLocation.Start) { Query = query, Field = field };
    }

    static NavigationItemSyntax ToNavigationItem(JsonObject item, string id, string title, string scope, SceneTransportGaps gaps)
    {
        gaps.UnknownMembers(item, scope, _navigationMembers);
        var icon = SceneNavigationIcons.Read(item);
        if (SceneJson.Has(item, "icon") && icon is null)
        {
            gaps.Member(scope, "icon", "an icon is named by text");
        }

        List<NavigationItemSyntax> children = [];
        foreach (var child in SceneJson.Array(item, "children").OfType<JsonObject>())
        {
            if (ToSyntax(child, scope, gaps) is NavigationItemSyntax navigation)
            {
                children.Add(navigation);
            }
            else if (SceneJson.String(child, "kind") != Navigation)
            {
                gaps.Member(scope, "children", "a navigation item holds navigation items");
            }
        }

        return new NavigationItemSyntax(id, title, SourceLocation.Start)
        {
            Icon = icon,
            Target = Target(SceneJson.Object(item, "target"), scope, gaps),
            Slot = SceneJson.String(item, "slot"),
            Children = children
        };
    }

    static NavigationTargetSyntax? Target(JsonObject? target, string scope, SceneTransportGaps gaps)
    {
        if (target is null || target.Count == 0)
        {
            return null;
        }

        gaps.UnknownMembers(target, $"{scope} target", _targetMembers);
        if (SceneJson.String(target, "module") is not { } module || !SceneJson.IsIdentifier(module))
        {
            gaps.Member($"{scope} target", "module", "a target names a module");
            return null;
        }

        var feature = SceneJson.String(target, "feature");
        if (feature is not null && !SceneJson.IsPath(feature))
        {
            gaps.Member($"{scope} target", "feature", "a feature is named by its path of names");
            return null;
        }

        return new NavigationTargetSyntax(module, feature, SourceLocation.Start);
    }

    static JsonObject ButtonJson(ToolbarButtonSyntax button)
    {
        var json = new JsonObject { ["kind"] = Button, ["id"] = button.Id, ["title"] = button.Title };
        SceneValues.Optional(json, "slice", button.Slice);
        SceneValues.Optional(json, "emphasis", button.Emphasis?.ToString().ToLowerInvariant());
        SceneNavigationIcons.Write(json, button.Icon);
        SceneValues.Optional(json, "authorize", button.Authorize is null ? null : ScenePolicies.Describe(button.Authorize.Requirement));
        SceneValues.Optional(json, "confirm", button.Confirm);
        if (button.Opens is { } opens)
        {
            json["opens"] = opens == HookOpening.Runs ? "none" : opens.ToString().ToLowerInvariant();
            if (opens == HookOpening.Slot)
            {
                SceneValues.Optional(json, "opensIn", button.OpensSlot);
            }
        }

        SceneValues.Optional(json, "subject", button.Subject?.ToString().ToLowerInvariant());
        SceneValues.Optional(json, "enabledWhen", button.EnabledWhen is null ? null : SceneEnabledWhen.Describe(button.EnabledWhen));
        return json;
    }

    static JsonObject GroupJson(OutletGroupSyntax group)
    {
        var json = new JsonObject { ["kind"] = Group, ["id"] = group.Id, ["title"] = group.Title };
        SceneNavigationIcons.Write(json, group.Icon);
        json["items"] = new JsonArray([.. group.Buttons.Select(button => (JsonNode)ToJson(button))]);
        return json;
    }

    static JsonObject FilterJson(OutletFilterSyntax filter)
    {
        var json = new JsonObject { ["kind"] = Filter, ["id"] = filter.Id, ["title"] = filter.Title };
        if (filter.Query is { } query && filter.Parameter is { } parameter)
        {
            json["sets"] = new JsonObject { ["query"] = query, ["parameter"] = parameter };
        }

        return json;
    }

    static JsonObject TabJson(OutletTabSyntax tab) =>
        new() { ["kind"] = Tab, ["id"] = tab.Id, ["title"] = tab.Title, ["shows"] = tab.Shows ?? string.Empty };

    static JsonObject StatJson(OutletStatSyntax stat)
    {
        var json = new JsonObject { ["kind"] = Stat, ["id"] = stat.Id, ["title"] = stat.Title };
        if (stat.Query is { } query && stat.Field is { } field)
        {
            json["valueFrom"] = new JsonObject { ["query"] = query, ["field"] = field };
        }

        return json;
    }

    static JsonObject NavigationJson(NavigationItemSyntax item)
    {
        var json = new JsonObject { ["kind"] = Navigation, ["id"] = item.Id, ["title"] = item.Title };
        SceneNavigationIcons.Write(json, item.Icon);
        if (item.Target is { } target)
        {
            var destination = new JsonObject { ["module"] = target.Module };
            SceneValues.Optional(destination, "feature", target.Feature);
            json["target"] = destination;
        }

        SceneValues.Optional(json, "slot", item.Slot);
        if (item.Children.Any())
        {
            json["children"] = new JsonArray([.. item.Children.Select(child => (JsonNode)ToJson(child))]);
        }

        return json;
    }
}
