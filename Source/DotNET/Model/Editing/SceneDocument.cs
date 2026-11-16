// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Everything an editor works on: the application's layouts, the templates built on them, the screens filling those, and the
/// two things that make a template configurable - what each layout or template exposes, and what each instance contributes.
/// </summary>
/// <remarks>
/// The engine's editing operations take a document and return a new one; they never change the one they were given. Names are
/// the identity of layouts and templates, and element ids must be unique across the whole document. Layouts, templates and
/// screens are held as the JSON they are written as: an element tree carries no type discriminator, so it is read by its shape,
/// and keeping it as data is what lets the same document be edited by this engine and by the TypeScript one.
/// </remarks>
public record SceneDocument
{
    /// <summary>
    /// Gets the layouts.
    /// </summary>
    public IReadOnlyList<JsonElement> Layouts { get; init; } = [];

    /// <summary>
    /// Gets the screen templates.
    /// </summary>
    public IReadOnlyList<JsonElement> ScreenTemplates { get; init; } = [];

    /// <summary>
    /// Gets the dialog templates.
    /// </summary>
    public IReadOnlyList<JsonElement> DialogTemplates { get; init; } = [];

    /// <summary>
    /// Gets the screens.
    /// </summary>
    public IReadOnlyList<JsonElement> Screens { get; init; } = [];

    /// <summary>
    /// Gets what each layout or template lets its consumers configure.
    /// </summary>
    public IReadOnlyList<ExposureDeclaration> Exposures { get; init; } = [];

    /// <summary>
    /// Gets the values each template instance sets on what was exposed to it.
    /// </summary>
    public IReadOnlyList<InstanceContribution> InstanceContributions { get; init; } = [];
}
