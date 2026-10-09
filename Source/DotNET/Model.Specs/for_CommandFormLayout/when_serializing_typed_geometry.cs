// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;
using Cratis.Scene.Model.Forms;

namespace Cratis.Scene.Model.for_CommandFormLayout;

public class when_serializing_typed_geometry : Specification
{
    static readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    Form _form = null!;
    Form _roundTripped = null!;

    void Establish() =>
        _form = new(
            "Register invoice",
            "RegisterInvoice",
            null,
            [new("amount", ComposeUsing: "calculateAmount", Placement: new("amount", 1, 2))],
            FormGenerationMode.Manual,
            new(
                [new(1, new(FormWidthUnit.Fraction, 2)), new(2, new(FormWidthUnit.Pixels, 320))],
                [new("amount", 1, 2, ColumnSpan: 1, Width: new(FormWidthUnit.Percent, 100))]));

    void Because() =>
        _roundTripped = JsonSerializer.Deserialize<Form>(JsonSerializer.Serialize(_form, _options), _options)!;

    [Fact] void should_keep_generation_mode_separate_from_geometry() => _roundTripped.GenerationMode.ShouldEqual(FormGenerationMode.Manual);
    [Fact] void should_roundtrip_unequal_column_widths() => _roundTripped.Layout!.Columns[1].Width!.Unit.ShouldEqual(FormWidthUnit.Pixels);
    [Fact] void should_roundtrip_field_placement() => _roundTripped.Layout!.Placements[0].Column.ShouldEqual(2);
    [Fact] void should_keep_compose_using_as_a_composition_reference() => _roundTripped.Fields[0].ComposeUsing.ShouldEqual("calculateAmount");
}
