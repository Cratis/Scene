// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// The document as the editing scope sees it: what was submitted, with whatever it does not carry filled in from the stored
/// documents it inherits from. A screen need not embed a copy of its template - the stored template is what it fills - so the
/// nesting is resolved over both.
/// </summary>
/// <param name="submitted">The document submitted.</param>
/// <param name="references">The stored documents it inherits from, by the name of the screen template each holds.</param>
sealed class CompletedDocument(ParsedSceneDocument submitted, IReadOnlyList<(string Name, ParsedSceneDocument Document)> references)
{
    /// <summary>
    /// Gets the names of the layouts, the document's own first.
    /// </summary>
    public IEnumerable<string> LayoutNames => Names(submitted.Layouts, document => document.Layouts);

    /// <summary>
    /// Gets the names of the screen templates, the document's own first.
    /// </summary>
    public IEnumerable<string> ScreenTemplateNames => Names(submitted.ScreenTemplates, document => document.ScreenTemplates);

    /// <summary>
    /// Finds a layout.
    /// </summary>
    /// <param name="name">The layout's name.</param>
    /// <returns>The layout, or <see langword="null"/> when neither the document nor a stored document has it.</returns>
    public JsonElement? Layout(string name) => Find(name, document => document.Layouts);

    /// <summary>
    /// Finds a screen template.
    /// </summary>
    /// <param name="name">The template's name.</param>
    /// <returns>The template, or <see langword="null"/> when neither the document nor a stored document has it.</returns>
    public JsonElement? ScreenTemplate(string name) => Find(name, document => document.ScreenTemplates);

    /// <summary>
    /// Finds a dialog template.
    /// </summary>
    /// <param name="name">The template's name.</param>
    /// <returns>The template, or <see langword="null"/> when neither the document nor a stored document has it.</returns>
    public JsonElement? DialogTemplate(string name) => Find(name, document => document.DialogTemplates);

    /// <summary>
    /// Finds a screen. Only the document itself has screens.
    /// </summary>
    /// <param name="name">The screen's name.</param>
    /// <returns>The screen, or <see langword="null"/> when the document does not have it.</returns>
    public JsonElement? Screen(string name) => submitted.Screens.TryGetValue(name, out var screen) ? screen : null;

    /// <summary>
    /// Finds what an owner exposes.
    /// </summary>
    /// <param name="owner">The name of the layout or template.</param>
    /// <returns>The exposure the document declares or, failing that, a stored document's; <see langword="null"/> when there is none.</returns>
    public ExposureEntry? Exposure(string owner)
    {
        if (submitted.Exposures.TryGetValue(owner, out var own))
        {
            return own;
        }

        return references
            .Select(reference => reference.Document.Exposures.GetValueOrDefault(owner))
            .FirstOrDefault(entry => entry is not null);
    }

    IEnumerable<string> Names(Dictionary<string, JsonElement> own, Func<ParsedSceneDocument, Dictionary<string, JsonElement>> select) =>
        own.Keys.Concat(references.SelectMany(reference => select(reference.Document).Keys)).Distinct();

    JsonElement? Find(string name, Func<ParsedSceneDocument, Dictionary<string, JsonElement>> select)
    {
        if (select(submitted).TryGetValue(name, out var own))
        {
            return own;
        }

        foreach (var (_, document) in references)
        {
            if (select(document).TryGetValue(name, out var inherited))
            {
                return inherited;
            }
        }

        return null;
    }
}
