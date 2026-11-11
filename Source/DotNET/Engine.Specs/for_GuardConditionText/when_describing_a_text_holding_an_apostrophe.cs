// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Guards;

namespace Cratis.Scene.Engine.for_GuardConditionText;

/// <summary>
/// Pins the C# runtime's escaping of an apostrophe in a described text. The TypeScript engine writes a literal apostrophe
/// instead (a divergence outside the shared corpus, Cratis/Scene#301).
/// </summary>
public class when_describing_a_text_holding_an_apostrophe : Specification
{
    string _result;

    void Because() => _result = GuardConditionText.Describe(JsonElement.Parse("""{"kind":"comparison","left":{"subject":"item.a"},"operator":"Equal","right":"a'b"}"""));

    [Fact] void should_escape_the_apostrophe_as_a_unicode_escape() => _result.ShouldEqual("item.a == \"a\\u0027b\"");
}
