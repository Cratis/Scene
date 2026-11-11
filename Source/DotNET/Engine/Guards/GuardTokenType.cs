// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Guards;

/// <summary>
/// What a guard condition token is.
/// </summary>
enum GuardTokenType
{
    /// <summary>A dotted path such as <c language="screenplay">item.stock</c>.</summary>
    Path = 0,

    /// <summary>A quoted text, a number, <c language="screenplay">true</c>, <c language="screenplay">false</c> or <c language="screenplay">null</c>.</summary>
    Literal = 1,

    /// <summary>A comparison operator.</summary>
    Operator = 2,

    /// <summary>An <c language="screenplay">and</c> or <c language="screenplay">or</c>.</summary>
    Logical = 3,

    /// <summary>An opening parenthesis.</summary>
    Open = 4,

    /// <summary>A closing parenthesis.</summary>
    Close = 5,
}
