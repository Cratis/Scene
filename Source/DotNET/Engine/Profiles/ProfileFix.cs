// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One undoable edit a host can offer for a problem. Applying it is <c language="csharp">ProfileBlockers.ApplyFix</c>; a host never edits the profile itself.
/// </summary>
/// <param name="Kind">What the fix does.</param>
/// <param name="Label">The label of the button.</param>
/// <param name="Package">For <see cref="ProfileFixKind.AddPackage"/>: the package to add.</param>
public record ProfileFix(ProfileFixKind Kind, string Label, string? Package = null);
