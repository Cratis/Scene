// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements.Panels;

/// <summary>
/// Places its children at absolute coordinates. A child states where it sits through the
/// <c>Canvas.Left</c>, <c>Canvas.Top</c>, <c>Canvas.Right</c> and <c>Canvas.Bottom</c> keys of its
/// <see cref="SceneElement.Properties"/>, which is how an attached property is carried in a model
/// that has no attached properties of its own.
/// </summary>
public record Canvas : Panel;
