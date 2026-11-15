// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// A request a design turn would not do - free styling, or anything the catalogue does not offer - with what it can do instead.
/// </summary>
/// <param name="Code">Why, as one of <see cref="DesignRefusalCode"/>.</param>
/// <param name="Reason">Why, in a sentence.</param>
/// <param name="Alternatives">What can be done instead: operations that would be accepted, or a proposal to the design system.</param>
public record DesignTurnRefusal(string Code, string Reason, IReadOnlyList<DesignAlternative> Alternatives);
