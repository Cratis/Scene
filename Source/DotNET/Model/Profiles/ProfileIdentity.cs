// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// Who the application is: the name and the logo every blueprint draws, set once for the whole application.
/// </summary>
/// <param name="Name">The application name the shell shows, or <see langword="null"/> for the host's application name.</param>
/// <param name="Logo">The logo, or <see langword="null"/> for initials taken from the name.</param>
/// <param name="ShowName">Whether the name is shown beside the logo mark, or <see langword="null"/> for shown.</param>
public record ProfileIdentity(
    string? Name = null,
    ProfileLogo? Logo = null,
    bool? ShowName = null);
