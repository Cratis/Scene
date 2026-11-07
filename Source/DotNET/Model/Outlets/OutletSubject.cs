// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// What an outlet of actions, or one of its actions, acts on: Screenplay's <c language="screenplay">for item | for screen</c>.
/// </summary>
public enum OutletSubject
{
    /// <summary>One item of the data the screen shows, such as a row of a table.</summary>
    Item = 0,

    /// <summary>The screen as a whole.</summary>
    Screen = 1,
}
