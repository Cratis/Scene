// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// What one check of a changed document works with: the scope being edited, the document submitted, the one it replaces, the
/// stored documents it inherits from, and the violations found so far.
/// </summary>
/// <param name="scope">The screen, template or layout the change was made to.</param>
/// <param name="submitted">The document submitted.</param>
/// <param name="previous">The stored document it replaces, or <see langword="null"/> for a first save.</param>
/// <param name="references">The stored documents the scope inherits from, by the name of the screen template each holds.</param>
sealed class ChangeContext(
    EditingScope scope,
    ParsedSceneDocument submitted,
    ParsedSceneDocument? previous,
    IReadOnlyList<(string Name, ParsedSceneDocument Document)> references)
{
    readonly List<SceneDocumentViolation> _violations = [];

    /// <summary>
    /// Gets the screen, template or layout the change was made to.
    /// </summary>
    public EditingScope Scope { get; } = scope;

    /// <summary>
    /// Gets the document submitted.
    /// </summary>
    public ParsedSceneDocument Submitted { get; } = submitted;

    /// <summary>
    /// Gets the stored document the submitted one replaces, or <see langword="null"/> for a first save.
    /// </summary>
    public ParsedSceneDocument? Previous { get; } = previous;

    /// <summary>
    /// Gets the stored documents the scope inherits from, by the name of the screen template each holds.
    /// </summary>
    public IReadOnlyList<(string Name, ParsedSceneDocument Document)> References { get; } = references;

    /// <summary>
    /// Gets the violations found so far.
    /// </summary>
    public IReadOnlyList<SceneDocumentViolation> Violations => _violations;

    /// <summary>
    /// Whether the scope is the screen, template or layout that owns the named thing. A screen owns only itself: it declares
    /// no exposure, because nothing sits inside it.
    /// </summary>
    /// <param name="kind">The kind of thing.</param>
    /// <param name="name">Its name.</param>
    /// <returns><see langword="true"/> when the scope owns it; otherwise <see langword="false"/>.</returns>
    public bool Owns(EditingScopeKind kind, string name) => Scope.Kind == kind && Scope.Name == name;

    /// <summary>
    /// Records a violation.
    /// </summary>
    /// <param name="code">What kind of rule was broken.</param>
    /// <param name="message">A message fit to show the person who made the change.</param>
    /// <param name="subject">What it is about, when there is one.</param>
    public void Add(SceneDocumentViolationCode code, string message, string? subject = null) =>
        _violations.Add(new SceneDocumentViolation(code, message, subject));

    /// <summary>
    /// Whether a stored document establishes an owner by name. An owner that establishes no exposure still establishes that
    /// nothing is exposed; an absent declaration is not the same as an unknown owner.
    /// </summary>
    /// <param name="owner">The layout, template, dialog template or screen name.</param>
    /// <returns><see langword="true"/> when a reference establishes the owner; otherwise <see langword="false"/>.</returns>
    public bool HasReferenceOwner(string owner) => References.Any(reference =>
        reference.Name == owner
        || reference.Document.Layouts.ContainsKey(owner)
        || reference.Document.ScreenTemplates.ContainsKey(owner)
        || reference.Document.DialogTemplates.ContainsKey(owner)
        || reference.Document.Screens.ContainsKey(owner));

    /// <summary>
    /// Gets what an authoritative owner exposes, retaining whether the owner itself is known when it exposes nothing.
    /// </summary>
    /// <param name="owner">The owner.</param>
    /// <returns>The known-owner state and its declaration, when it has one.</returns>
    public (bool Known, ExposureEntry? Entry) ReferenceExposure(string owner)
    {
        var named = References.Where(reference => reference.Name == owner).Concat(References.Where(reference => reference.Name != owner));
        foreach (var (_, document) in named)
        {
            if (document.Exposures.TryGetValue(owner, out var entry))
            {
                return (true, entry);
            }
        }

        return (HasReferenceOwner(owner), null);
    }

    /// <summary>
    /// Gets what an authoritative instance contributes, retaining whether the instance itself is known when it contributes
    /// nothing. A known instance with no contribution is an authoritative empty value.
    /// </summary>
    /// <param name="instance">The id of the instance.</param>
    /// <returns>The known-instance state and its contributions.</returns>
    public (bool Known, IReadOnlyList<ContributionEntry> Entries) ReferenceContributions(string instance)
    {
        var (prefix, name) = instance.Split(':', 2) is [var kind, var value] ? (kind, value) : (string.Empty, string.Empty);
        var named = References.Where(reference => reference.Name == name).Concat(References.Where(reference => reference.Name != name));
        var known = false;
        foreach (var (_, document) in named)
        {
            known |= prefix switch
            {
                "template" => document.ScreenTemplates.ContainsKey(name),
                "screen" => document.Screens.ContainsKey(name),
                "dialog" => document.DialogTemplates.ContainsKey(name),
                "layout" => document.Layouts.ContainsKey(name),
                _ => false
            };
            var entries = document.ContributionsOf(instance).ToList();
            if (entries.Count > 0)
            {
                return (true, entries);
            }
        }

        return (known, []);
    }

    /// <summary>
    /// The stored document a thing is authoritatively kept in: the document of the template that bears its name when there is
    /// one, otherwise the first stored document that has it.
    /// </summary>
    /// <typeparam name="T">The type of thing picked from a document.</typeparam>
    /// <param name="name">The name of the thing.</param>
    /// <param name="pick">Picks the thing from a document, or <see langword="null"/> when the document does not have it.</param>
    /// <returns>The thing as that document has it, or <see langword="null"/> when no stored document has it.</returns>
    public T? Reference<T>(string name, Func<ParsedSceneDocument, T?> pick)
        where T : struct
    {
        var named = References.Where(reference => reference.Name == name).Concat(References.Where(reference => reference.Name != name));
        foreach (var (_, document) in named)
        {
            if (pick(document) is { } found)
            {
                return found;
            }
        }

        return null;
    }
}
