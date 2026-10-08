// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Common;

/// <summary>
/// The navigational surface a destination opens.
/// </summary>
public enum DestinationKind
{
    /// <summary>Replace content in a named outlet.</summary>
    Outlet = 0,

    /// <summary>Open a dialog surface.</summary>
    Dialog = 1,

    /// <summary>Navigate to an external target.</summary>
    External = 2,
}
