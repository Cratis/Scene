// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Navigation;

/// <summary>
/// The application's logo. It is defined at the application level only; a module shows it locked.
/// </summary>
/// <param name="Image">The image reference.</param>
/// <param name="Title">The application name shown with or instead of the image.</param>
public record ApplicationLogo(string Image, string Title);
