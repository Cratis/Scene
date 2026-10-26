// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// A path starting with item., resolved against the selected subject.
/// </summary>
/// <param name="Subject">The subject path.</param>
public record SubjectReference(string Subject);
