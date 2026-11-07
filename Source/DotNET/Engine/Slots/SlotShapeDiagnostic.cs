// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Slots;

/// <summary>
/// One problem with the slots of a stored Scene document.
/// </summary>
/// <param name="Code">The engine-owned code.</param>
/// <param name="Path">Where in the document the problem is, as a JSON path such as <c language="csharp">$.layouts[0].slots[1]</c>.</param>
/// <param name="Message">The human message; it carries real names.</param>
public record SlotShapeDiagnostic(SlotShapeDiagnosticCode Code, string Path, string Message);
