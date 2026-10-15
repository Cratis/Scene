// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Structure;

/// <summary>
/// One problem with an application structure.
/// </summary>
/// <param name="Code">What kind of problem this is.</param>
/// <param name="Message">A sentence naming the ids or names involved.</param>
/// <param name="Id">The qualified id of the node the problem was found on.</param>
public record StructureDiagnostic(StructureDiagnosticCode Code, string Message, string Id);
