// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.ContributionPoints;
using Cratis.Scene.Model.Elements;
using Cratis.Scene.Model.Forms;

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A named screen: a layout, the content that fills its slots, the forms it hosts, and whatever it
/// contributes to contribution points elsewhere in the tree.
/// </summary>
/// <param name="Name">The screen's name.</param>
/// <param name="Layout">The resolved name of the <see cref="Layouts.Layout"/> this screen uses.</param>
/// <param name="SlotContent">The content filling each of the layout's slots, keyed by slot name.</param>
/// <param name="Forms">The forms this screen hosts.</param>
/// <param name="Contributions">What this screen contributes to contribution points elsewhere in the tree.</param>
public record Screen(
    string Name,
    string Layout,
    IReadOnlyDictionary<string, IReadOnlyList<SceneElement>> SlotContent,
    IReadOnlyList<Form> Forms,
    IReadOnlyList<Contribution> Contributions);
