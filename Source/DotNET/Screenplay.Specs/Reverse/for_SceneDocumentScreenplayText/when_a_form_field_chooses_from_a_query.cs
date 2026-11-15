// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayText;

// Cratis/StudioIssues#1332: a field whose property is the key of a read model that a list query returns is a picker over that query. The editor writes it on
// the field, and the export says it as the `choose from query` line under the field.
public class when_a_form_field_chooses_from_a_query : Specification
{
    const string Document =
        """
        {
          "layouts": [{ "name": "StudioScreen", "slots": [{ "name": "content" }] }],
          "screenTemplates": [],
          "dialogTemplates": [],
          "screens": [{
            "name": "Screen", "layout": "StudioScreen", "contributions": [],
            "slotContent": { "content": [] },
            "forms": [{ "name": "DraftProduct", "forCommand": "DraftProduct", "generationMode": "manual", "fields": [
              { "name": "sku", "sourceProperty": "sku", "label": "SKU" },
              { "name": "category", "sourceProperty": "category", "choices": { "query": "AllCategories", "show": "name" } }
            ] }]
          }],
          "exposures": [],
          "instanceContributions": []
        }
        """;

    string _code = string.Empty;
    IReadOnlyList<string> _warnings = [];
    SceneDocumentScreenplayExport _export = null!;

    void Because()
    {
        (_code, _warnings) = SceneDocumentScreenplayText.OfScreen("Seller", string.Empty, Document);
        _export = SceneDocumentScreenplayBridge.Export("Seller", string.Empty, Document);
    }

    [Fact] void should_write_the_picker_line() => _code.ShouldContain("choose from query AllCategories show name");
    [Fact] void should_have_nothing_it_could_not_say() => _warnings.ShouldBeEmpty();
    [Fact] void should_carry_the_choices_on_the_field() => _export.Forms.Single().Fields.Single(field => field.Property == "category").Choices!.Show.ShouldEqual("name");
    [Fact] void should_leave_a_plain_field_without_choices() => _export.Forms.Single().Fields.Single(field => field.Property == "sku").Choices.ShouldBeNull();
    [Fact] void should_say_it_again_as_the_same_choices() => SceneForms.ToJson(_export.Forms.Single(), new SceneScreenNames("Seller", ["Screen"]))["fields"]![1]!["choices"]!["query"]!.GetValue<string>().ShouldEqual("AllCategories");
}
