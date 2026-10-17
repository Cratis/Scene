// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One thing wrong with the appearance, with a message written for the person editing it.
/// </summary>
/// <param name="Code">What is wrong.</param>
/// <param name="Message">The explanation.</param>
public record AppearanceDiagnostic(AppearanceDiagnosticCode Code, string Message);
