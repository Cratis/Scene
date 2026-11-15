// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// What is wrong with one field of a value.
/// </summary>
/// <param name="Field">The field.</param>
/// <param name="Problem">What is wrong, as a phrase that follows the field.</param>
sealed record ItemFieldProblem(string Field, string Problem);
