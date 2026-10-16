// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// The outcome of migrating a legacy profile.
/// </summary>
/// <param name="Profile">The profile in the new shape: root, appearance and defaults filled in, the legacy <see cref="UiProfile.Layout"/> gone once the root replaces it.</param>
/// <param name="Changed">Whether the migrated profile differs from the one that came in. Always <see langword="false"/> for a profile that is already migrated.</param>
/// <param name="Diagnostics">What could not be mapped. The profile is still returned, with the unmapped legacy values left where they were.</param>
public record ProfileMigration(UiProfile Profile, bool Changed, IReadOnlyList<ProfileMigrationDiagnostic> Diagnostics);
