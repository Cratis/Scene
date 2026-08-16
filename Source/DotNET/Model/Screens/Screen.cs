// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.ContributionPoints;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Forms;

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A named screen: the structure it fills, the content that fills it, the forms it hosts, and whatever it
/// contributes to contribution points elsewhere in the tree.
/// </summary>
/// <remarks>
/// A screen is an instance, not a shape. The shape comes from either the application's
/// <see cref="Layouts.Layout"/> - for a screen that sits directly in the application shell - or a
/// <see cref="ScreenTemplate"/>, for one nested inside a module, feature or slice. Both declare slots; a
/// screen only ever fills them.
/// </remarks>
/// <param name="Name">The screen's name.</param>
/// <param name="Layout">The resolved name of the application <see cref="Layouts.Layout"/> this screen ultimately renders inside.</param>
/// <param name="SlotContent">The content filling each slot, keyed by slot name.</param>
/// <param name="Forms">The forms this screen hosts.</param>
/// <param name="Contributions">What this screen contributes to contribution points elsewhere in the tree.</param>
/// <param name="ScreenTemplate">
/// The resolved name of the <see cref="Screens.ScreenTemplate"/> this screen fills, or
/// <see langword="null"/> when it fills the <paramref name="Layout"/>'s own slots directly. The template's
/// <see cref="Screens.ScreenTemplate.FitsSlot"/> is what decides where it lands, so a screen never has to
/// state its own position.
/// </param>
public record Screen(
    string Name,
    string Layout,
    IReadOnlyDictionary<string, IReadOnlyList<SceneElement>> SlotContent,
    IReadOnlyList<Form> Forms,
    IReadOnlyList<Contribution> Contributions,
    string? ScreenTemplate = null);
