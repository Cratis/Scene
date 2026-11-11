// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Guards;

namespace Cratis.Scene.Engine.for_GuardConditionText;

/// <summary>
/// Pins the C# runtime's serialization of a negative zero. The TypeScript engine serializes it as 0
/// (a divergence outside the shared corpus).
/// </summary>
public class when_parsing_a_negative_zero : Specification
{
    string _result;

    void Because() => _result = GuardConditionText.Parse("item.a == -0")!.Value.GetRawText();

    [Fact] void should_keep_the_sign_of_the_zero() => _result.ShouldContain("\"right\":-0}");
}
