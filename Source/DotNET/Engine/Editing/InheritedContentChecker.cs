// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Checks that nothing the scope does not own was changed. A layout, a template or a screen other than the one being edited, what
/// such an owner exposes, and what another instance set are all inherited: the scope may fill and configure them, not change
/// them. A thing is unchanged when it is what the document had before, or - when it did change - when it is what its stored
/// document says it is, which is how a stale copy is brought up to date. A thing that is new and that no stored document knows is
/// taken to be authored by this document.
/// </summary>
static class InheritedContentChecker
{
    /// <summary>
    /// A reference that is known to hold nothing, as opposed to no reference at all. It is equal to no value.
    /// </summary>
    static readonly JsonElement? _nothingStored = default(JsonElement);

    /// <summary>
    /// Checks what the scope inherits.
    /// </summary>
    /// <param name="context">The check being made.</param>
    public static void Check(ChangeContext context)
    {
        CheckNamed(context, "layout", EditingScopeKind.Layout, document => document.Layouts);
        CheckNamed(context, "screen template", EditingScopeKind.ScreenTemplate, document => document.ScreenTemplates);
        CheckNamed(context, "dialog template", EditingScopeKind.DialogTemplate, document => document.DialogTemplates);
        CheckNamed(context, "screen", EditingScopeKind.Screen, document => document.Screens);
        CheckExposures(context);
        CheckContributions(context);
    }

    static void CheckNamed(ChangeContext context, string kind, EditingScopeKind ownedKind, Func<ParsedSceneDocument, Dictionary<string, JsonElement>> select)
    {
        var submitted = select(context.Submitted);
        var previous = context.Previous is null ? [] : select(context.Previous);

        foreach (var name in submitted.Keys.Concat(previous.Keys).Distinct().Where(name => !context.Owns(ownedKind, name)))
        {
            var reference = context.Reference(name, document => Lookup(select(document), name));
            var authoritativeAbsence = context.References.Count > 0 && reference is null && previous.Count == 0;
            Judge(context, $"The {kind} '{name}'", name, Lookup(submitted, name), Lookup(previous, name), authoritativeAbsence ? _nothingStored : reference);
        }
    }

    static void CheckExposures(ChangeContext context)
    {
        var previous = context.Previous?.Exposures ?? [];
        var owners = context.Submitted.Exposures.Keys.Concat(previous.Keys).Distinct()
            .Where(owner => context.Scope.Kind == EditingScopeKind.Screen || owner != context.Scope.Name);

        foreach (var owner in owners)
        {
            var reference = context.ReferenceExposure(owner);
            Judge(context, $"What '{owner}' exposes", owner, Declared(context.Submitted.Exposures.GetValueOrDefault(owner)), Declared(previous.GetValueOrDefault(owner)), reference.Known ? Declared(reference.Entry) ?? _nothingStored : null);
        }
    }

    static void CheckContributions(ChangeContext context)
    {
        var scopeInstance = context.Scope.Instance();
        var previous = context.Previous?.Contributions ?? [];

        foreach (var instance in context.Submitted.Contributions.Concat(previous).Select(entry => entry.Instance).Distinct().Where(instance => instance != scopeInstance))
        {
            var submitted = context.Submitted.ContributionsOf(instance).ToList();
            var before = previous.Where(entry => entry.Instance == instance).ToList();
            var reference = context.ReferenceContributions(instance);

            foreach (var key in submitted.Concat(before).Concat(reference.Entries).Select(entry => entry.Key).Distinct())
            {
                Judge(
                    context,
                    $"What '{instance}' set for '{key.Path}' on '{key.Component}'",
                    instance,
                    Raw(submitted, key),
                    Raw(before, key),
                    reference.Known ? Raw(reference.Entries, key) ?? _nothingStored : null);
            }
        }
    }

    static void Judge(ChangeContext context, string what, string subject, JsonElement? submitted, JsonElement? previous, JsonElement? reference)
    {
        if (JsonData.DeepEquals(submitted, previous))
        {
            return;
        }

        var from = context.Scope.Describe();
        if (submitted is null)
        {
            context.Add(SceneDocumentViolationCode.NodeNotEditable, $"{what} is inherited and cannot be removed from {from}.", subject);
        }
        else if (reference is not null ? !JsonData.DeepEquals(submitted, reference) : previous is not null)
        {
            context.Add(SceneDocumentViolationCode.NodeNotEditable, $"{what} is inherited and cannot be changed from {from}.", subject);
        }
    }

    static JsonElement? Lookup(Dictionary<string, JsonElement> items, string name) =>
        items.TryGetValue(name, out var item) ? item : null;

    static JsonElement? Declared(ExposureEntry? entry) => entry?.IsEmpty == false ? entry.Raw : null;

    static JsonElement? Raw(IEnumerable<ContributionEntry> entries, (string Component, string Path) key) =>
        entries.FirstOrDefault(entry => entry.Key == key)?.Raw;
}
