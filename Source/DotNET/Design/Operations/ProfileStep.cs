// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>Changes a key of the profile.</summary>
/// <param name="Key">The key.</param>
/// <param name="Value">The value.</param>
internal sealed record ProfileStep(string Key, string Value) : LoweredStep;
