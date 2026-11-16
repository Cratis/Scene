// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// One thing an operation comes down to. A change of a node is a Scene edit the engine applies; declaring a screen or a template, removing a screen,
/// changing the profile and keeping the screen set are what Scene edits do not cover.
/// </summary>
internal abstract record LoweredStep;
