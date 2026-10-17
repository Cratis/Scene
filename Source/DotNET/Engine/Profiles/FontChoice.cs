// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One font an application can choose, with where it comes from and under what license.
/// </summary>
/// <param name="Id">The id stored in the profile's appearance.</param>
/// <param name="DisplayName">The name shown in a picker.</param>
/// <param name="Family">The CSS <c language="csharp">font-family</c> value the font token takes, ending in a generic fallback so a font that fails to load still renders.</param>
/// <param name="Source">Where the font comes from.</param>
/// <param name="Stylesheet">For a hosted font, the stylesheet a host loads to get it.</param>
/// <param name="License">The license the font is used under.</param>
/// <param name="LicenseUrl">The address of the license text.</param>
public record FontChoice(string Id, string DisplayName, string Family, FontSource Source, string? Stylesheet, string License, string? LicenseUrl);
