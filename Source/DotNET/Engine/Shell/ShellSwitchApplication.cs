// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Shell;

/// <summary>
/// The result of applying a <see cref="ShellSwitchPlan"/> to a document's screens and screen templates.
/// </summary>
/// <param name="Screens">The screens after the switch; the screens that were given when nothing was applied.</param>
/// <param name="ScreenTemplates">The screen templates after the switch; the templates that were given when nothing was applied.</param>
/// <param name="Applied">Whether the plan was applied: <see langword="false"/> when it has blockers, so there is nothing sound to apply.</param>
/// <param name="Changes">What changed, screens first in document order, then templates; empty when nothing did.</param>
public record ShellSwitchApplication(
    IReadOnlyList<Screen> Screens,
    IReadOnlyList<ScreenTemplate> ScreenTemplates,
    bool Applied,
    IReadOnlyList<ShellSwitchChange> Changes);
