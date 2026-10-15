// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// A problem found while resolving, which never stops the resolution falling through to the next rung.
/// </summary>
/// <param name="Code"><c language="csharp">packNotFound</c> or <c language="csharp">shapeNotInPack</c>.</param>
/// <param name="Message">The message.</param>
public record SampleDataDiagnostic(string Code, string Message);
