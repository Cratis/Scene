// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Guards;

/// <summary>
/// A structured predicate over the selected item.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(ComparisonGuardCondition), "comparison")]
[JsonDerivedType(typeof(LogicalGuardCondition), "logical")]
public abstract record GuardCondition;
