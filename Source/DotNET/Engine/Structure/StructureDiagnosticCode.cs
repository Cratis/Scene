// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Structure;

/// <summary>
/// What is wrong with an application structure. The camel-cased names are shared with the TypeScript engine.
/// </summary>
public enum StructureDiagnosticCode
{
    /// <summary>Two siblings share one id, so their qualified id does not identify a single node.</summary>
    StructureDuplicateId = 0,

    /// <summary>Two siblings with different ids share one display name, so a picker or a name lookup cannot tell them apart.</summary>
    StructureAmbiguousName = 1,
}
