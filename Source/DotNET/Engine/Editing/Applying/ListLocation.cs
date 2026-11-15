// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Where a node sits in an array it can be inserted into, removed from or moved within.
/// </summary>
/// <param name="Path">The path of the array.</param>
/// <param name="Index">The node's index in the array.</param>
sealed record ListLocation(DocumentPath Path, int Index);
