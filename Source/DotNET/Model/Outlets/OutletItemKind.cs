// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Outlets;

/// <summary>
/// The kind of one item of an outlet. It is the <c language="json">kind</c> every stored item carries.
/// </summary>
public enum OutletItemKind
{
    /// <summary>A button of an outlet of actions.</summary>
    Button = 0,

    /// <summary>An entry of a menu, in an outlet of actions or one of its groups.</summary>
    MenuEntry = 1,

    /// <summary>A separator between actions.</summary>
    Separator = 2,

    /// <summary>A group of actions shown as one menu.</summary>
    Group = 3,

    /// <summary>A filter of an outlet of filters.</summary>
    Filter = 4,

    /// <summary>A tab of an outlet of tabs.</summary>
    Tab = 5,

    /// <summary>A stat of an outlet of stats.</summary>
    Stat = 6,

    /// <summary>An item of an outlet of navigation.</summary>
    Navigation = 7,
}
