// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One legacy value the migration could not map.
/// </summary>
/// <param name="Code">The engine-owned code.</param>
/// <param name="Message">The human message. It carries real names, never ids.</param>
/// <param name="Subject">The legacy value the problem is about (a layout, blueprint, template name, colour scheme or navigation mode).</param>
public record ProfileMigrationDiagnostic(ProfileMigrationDiagnosticCode Code, string Message, string? Subject = null);
