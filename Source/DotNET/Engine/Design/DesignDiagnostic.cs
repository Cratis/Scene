// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// One thing wrong with the selection or resolution of a design system.
/// </summary>
/// <param name="Code">What is wrong.</param>
/// <param name="Message">The message, ready to show.</param>
public record DesignDiagnostic(DesignDiagnosticCode Code, string Message);
