// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Exposure;

/// <summary>
/// What a layout or template lets what sits inside it configure.
/// </summary>
/// <param name="Owner">The name of the layout or template that declares the exposure.</param>
/// <param name="Properties">The properties it exposes.</param>
public record ExposureDeclaration(string Owner, IReadOnlyList<ExposedProperty> Properties);
