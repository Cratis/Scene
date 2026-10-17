// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Whether a value for "my own shell" is valid, and what it is.
/// </summary>
/// <param name="Valid">Whether the value is valid.</param>
/// <param name="Kind">What the value names; <see langword="null"/> when it is not valid.</param>
/// <param name="Message">What is wrong; empty when the value is valid.</param>
public record OwnShellValue(bool Valid, OwnShellKind? Kind, string Message);
