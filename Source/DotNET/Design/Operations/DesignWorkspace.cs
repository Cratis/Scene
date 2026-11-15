// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.ScreenSets;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// What design operations change: the Scene document, the UI profile and the set of screens with their storylines.
/// </summary>
/// <param name="Document">The Scene document.</param>
/// <param name="ScreenSet">The screens and the storylines through them.</param>
/// <param name="Profile">The UI profile; absent when the design has none to change.</param>
public record DesignWorkspace(SceneDocument Document, ScreenSet ScreenSet, UiProfile? Profile = null);
