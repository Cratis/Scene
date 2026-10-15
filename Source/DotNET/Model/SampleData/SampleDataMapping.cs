// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// An explicit <c language="csharp">shape → read model</c> mapping, for when a pack's shape name differs from the read model's.
/// </summary>
/// <param name="Shape">The shape name in the pack.</param>
/// <param name="ReadModel">The read model (or shape) name the pack's shape supplies rows for.</param>
public record SampleDataMapping(string Shape, string ReadModel);
