// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// A structural role a template can take beyond its kind.
/// </summary>
public enum TemplateRole
{
    /// <summary>
    /// The application's root template - its shell. A screen template with this role and scope <see cref="TemplateScope.Application"/>
    /// can be the shell of an application exactly like a <see cref="Layouts.Layout"/>; it fits no slot of anything else.
    /// </summary>
    Root = 0
}
