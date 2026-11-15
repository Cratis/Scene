// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design;

/// <summary>
/// What a design session is about.
/// </summary>
public enum DesignSubjectKind
{
    /// <summary>A story.</summary>
    Story = 0,

    /// <summary>An issue.</summary>
    Issue = 1,

    /// <summary>An application.</summary>
    Application = 2,

    /// <summary>A design system.</summary>
    DesignSystem = 3,

    /// <summary>Anything else the host designs for.</summary>
    Custom = 4,
}
