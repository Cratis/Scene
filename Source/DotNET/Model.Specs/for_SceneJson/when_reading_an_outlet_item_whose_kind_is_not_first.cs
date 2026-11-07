// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Model.Outlets;

namespace Cratis.Scene.Model.for_SceneJson;

public class when_reading_an_outlet_item_whose_kind_is_not_first : Specification
{
    /// <summary>
    /// An outlet item as JavaScript writes it when the object was built with its kind added last.
    /// </summary>
    const string Written = """[{"id":"add","title":"Add product","slice":"catalog.products.DraftProduct","emphasis":"primary","kind":"button"},{"id":"pricing","title":"Pricing","shows":"catalog.pricing.ProductPricing","kind":"tab"}]""";

    const string WrittenWithoutEnumerations = """[{"id":"add","title":"Add product","kind":"button"},{"id":"pricing","title":"Pricing","shows":"catalog.pricing.ProductPricing","kind":"tab"}]""";

    static readonly JsonSerializerOptions _hostOptions = SceneJson.Configure(new JsonSerializerOptions(JsonSerializerDefaults.Web));
    static readonly JsonSerializerOptions _unconfiguredOptions = new(JsonSerializerDefaults.Web);

    IReadOnlyList<OutletItem> _items = null!;
    IReadOnlyList<OutletItem> _configured = null!;
    Exception? _unconfigured;

    void Because()
    {
        _items = JsonSerializer.Deserialize<List<OutletItem>>(Written, SceneJson.Options)!;
        _configured = JsonSerializer.Deserialize<List<OutletItem>>(WrittenWithoutEnumerations, _hostOptions)!;
        try
        {
            JsonSerializer.Deserialize<List<OutletItem>>(WrittenWithoutEnumerations, _unconfiguredOptions);
        }
        catch (Exception exception) when (exception is JsonException or NotSupportedException)
        {
            _unconfigured = exception;
        }
    }

    [Fact] void should_not_be_readable_with_options_that_are_not_configured() => _unconfigured.ShouldNotBeNull();

    [Fact] void should_read_the_button() => ((OutletButton)_items[0]).Slice.ShouldEqual("catalog.products.DraftProduct");
    [Fact] void should_read_its_emphasis() => ((OutletButton)_items[0]).Emphasis.ShouldEqual(Toolbar.ToolbarEmphasis.Primary);
    [Fact] void should_read_the_tab() => ((OutletTab)_items[1]).Shows.ShouldEqual("catalog.pricing.ProductPricing");
    [Fact] void should_read_it_with_a_host_s_own_options_once_configured() => _configured.Select(item => item.Kind).ShouldContainOnly(OutletItemKind.Button, OutletItemKind.Tab);
}
