// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// What <see cref="DesignComponentEvaluator.Evaluate"/> produced.
/// </summary>
/// <param name="Components">The components with every part resolved to a value.</param>
/// <param name="Problems">Each part whose token role has no value, as a message naming the component, variant, state and part.</param>
public record EvaluatedDesignComponents(IReadOnlyList<ResolvedDesignComponent> Components, IReadOnlyList<string> Problems);
