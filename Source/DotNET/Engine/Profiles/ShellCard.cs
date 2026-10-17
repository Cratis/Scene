// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// One shell a designer offers as a card: what to call it, what it is, its wireframe and the menu mode it starts in.
/// </summary>
/// <param name="Blueprint">The package the shell comes from; empty for the application's own.</param>
/// <param name="Id">The template's name, which is what a root template reference names.</param>
/// <param name="Title">The card's title.</param>
/// <param name="Description">The card's one-line description.</param>
/// <param name="Thumbnail">The package-relative path of the wireframe thumbnail.</param>
/// <param name="DefaultMenuMode">The menu mode choosing this shell sets (the author can change it afterwards).</param>
public record ShellCard(string Blueprint, string Id, string Title, string Description, string Thumbnail, NavigationMode DefaultMenuMode);
