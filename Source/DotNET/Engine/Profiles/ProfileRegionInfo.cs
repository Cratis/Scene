// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One region a shell exposes in a mode and state.
/// </summary>
/// <param name="Id">The region.</param>
/// <param name="Label">The label the designer shows.</param>
/// <param name="Section">The section of the inspector the region edits.</param>
/// <param name="Drawn">Whether the region is drawn in this mode and state.</param>
/// <param name="Fallback">The region to use when this one is not drawn. The host never invents one.</param>
public record ProfileRegionInfo(ProfileRegion Id, string Label, ProfileSection Section, bool Drawn, ProfileRegion? Fallback = null);
