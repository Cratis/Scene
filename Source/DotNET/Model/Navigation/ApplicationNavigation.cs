// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// The application-level navigation: the outlets the application's shell layout declares, which every module inherits,
/// extends or overrides. A navigation region is an outlet of navigation named after the region (<c language="csharp">topbar</c>,
/// <c language="csharp">sidebar</c>), a navigation contribution point is an outlet of navigation named after the point (such as
/// <c language="csharp">Navigation</c>), and a region's toolbar buttons are an outlet of actions named <c language="csharp">&lt;region&gt;Buttons</c>.
/// The shell always offers the <c language="csharp">topbar</c> and <c language="csharp">sidebar</c> outlets of navigation and their
/// <c language="csharp">topbarButtons</c> and <c language="csharp">sidebarButtons</c> outlets of actions; the application declares only those it
/// gives default items to.
/// </summary>
/// <param name="Outlets">The outlets the application declares, with their default items.</param>
/// <param name="Logo">The application logo.</param>
public record ApplicationNavigation(IReadOnlyList<Outlet> Outlets, ApplicationLogo? Logo = null);
