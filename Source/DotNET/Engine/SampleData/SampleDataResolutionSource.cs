// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Which rung of the resolution order supplied the rows. In documents the member is written in camel case.
/// </summary>
public enum SampleDataResolutionSource
{
    /// <summary>A pack explicitly bound to the read model or shape.</summary>
    Binding = 0,

    /// <summary>The application's active pack.</summary>
    ActivePack = 1,

    /// <summary>The default pack of the blueprint the template came from.</summary>
    BlueprintDefault = 2,

    /// <summary>Generated, typed by field kind.</summary>
    Generated = 3,

    /// <summary>Not resolved, because the host is not in design or preview mode.</summary>
    Disabled = 4,

    /// <summary>No pack had rows and no shape was given to generate from.</summary>
    None = 5
}
