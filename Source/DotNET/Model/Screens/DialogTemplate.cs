// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Layouts;

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A reusable dialog structure - the same idea as a <see cref="ScreenTemplate"/>, for content that opens
/// over an application rather than sitting inside it.
/// </summary>
/// <remarks>
/// A dialog has no <see cref="ScreenTemplate.FitsSlot"/> because it occupies no slot: it is an overlay,
/// summoned by something rather than placed by a containing layout. Everything else is the same, which is
/// deliberate - a confirmation dialog and a detail screen are both "slots with an arrangement, filled with
/// content", and there is no reason for an author to learn that twice.
/// </remarks>
/// <param name="Name">The template's name.</param>
/// <param name="Slots">The slots this template offers to whatever it contains, in declaration order.</param>
/// <param name="Arrangement">
/// How this template's own <paramref name="Slots"/> position relative to each other, or
/// <see langword="null"/> for declaration order with no further positioning.
/// </param>
/// <param name="Content">Content the template itself provides, keyed by slot name - a dialog's own chrome, such as its header and button bar.</param>
/// <param name="DisplayName">A human-readable name for a template picker, falling back to <paramref name="Name"/>.</param>
/// <param name="Description">A one-line description for a template picker.</param>
public record DialogTemplate(
    string Name,
    IReadOnlyList<Slot> Slots,
    Arrangement? Arrangement = null,
    IReadOnlyDictionary<string, IReadOnlyList<SceneElement>>? Content = null,
    string? DisplayName = null,
    string? Description = null);
