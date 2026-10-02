// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Checks that a changed Scene document stays within what its editing scope may change, the way the editor does, so a server
/// holds a client that did not use the editor to the same rules.
/// </summary>
/// <remarks>
/// <para>
/// The rules are the ones of the TypeScript editing engine, and a shared fixture corpus (<c language="csharp">document-change-fixtures.json</c>)
/// is run through both so they cannot drift:
/// </para>
/// <list type="bullet">
/// <item>what the scope inherits - an outer layout or template, what its owner exposes, what another instance set - is unchanged;</item>
/// <item>an instance sets only what an owner exposed to it, and does to an exposed collection only what the owner granted:
/// adding, removing, reordering, changing fields, and only the fields left editable;</item>
/// <item>a template re-exposes only what an outer owner exposed, and never more of it than that owner granted.</item>
/// </list>
/// <para>
/// Only changes are judged. What the document already held when it was stored is left alone, so a value kept after an exposure was
/// withdrawn, or a copy of a template that has since moved on, does not block saving. Whether a value fits the property's type is
/// not checked: that belongs to the component descriptors, and the engine ignores a value that does not fit when it resolves.
/// </para>
/// </remarks>
public static class SceneDocumentChangeValidation
{
    /// <summary>
    /// Checks a document that is about to replace another.
    /// </summary>
    /// <param name="scope">The screen, template or layout the change was made to.</param>
    /// <param name="previous">The stored document it replaces, or <see langword="null"/> when this is the first save.</param>
    /// <param name="submitted">The document submitted, as JSON text.</param>
    /// <param name="references">
    /// The stored documents the scope inherits from, by the name of the screen template each one holds - the other templates in
    /// the chain, not the one being edited. A document that cannot be read is ignored.
    /// </param>
    /// <returns>The violations found. Empty when the change is allowed.</returns>
    public static SceneDocumentChangeResult Validate(
        EditingScope scope,
        string? previous,
        string submitted,
        IReadOnlyDictionary<string, string>? references = null)
    {
        if (!ParsedSceneDocument.TryParse(submitted, out var document, out var problem))
        {
            return Refused(SceneDocumentViolationCode.DocumentUnreadable, $"The document cannot be read: {problem}.");
        }

        var before = ParsedSceneDocument.TryParse(previous, out var stored, out _) ? stored : null;
        var stores = (references ?? new Dictionary<string, string>())
            .OrderBy(reference => reference.Key, StringComparer.Ordinal)
            .Select(reference => (reference.Key, Document: ParsedSceneDocument.TryParse(reference.Value, out var parsed, out _) ? parsed : null))
            .Where(reference => reference.Document is not null)
            .Select(reference => (reference.Key, reference.Document!))
            .ToList();

        var context = new ChangeContext(scope, document!, before, stores);
        var completed = new CompletedDocument(document!, stores);
        var chain = TemplateChainBuilder.Build(scope, completed);
        if (chain.Count == 0)
        {
            return Refused(SceneDocumentViolationCode.UnknownScope, $"There is no {Describe(scope)} in the document.");
        }

        var grants = ExposureGrants.Compute(chain);
        InheritedContentChecker.Check(context);
        ExposureChecker.Check(context, chain, grants);
        ContributionChecker.Check(context, chain, grants);
        return new SceneDocumentChangeResult(context.Violations);
    }

    static SceneDocumentChangeResult Refused(SceneDocumentViolationCode code, string message) =>
        new([new SceneDocumentViolation(code, message)]);

    static string Describe(EditingScope scope) => scope.Describe()[4..];
}
