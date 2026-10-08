// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.for_TemplateApplicability;

public class when_filtering_for_a_nested_scope : Specification
{
    ScreenTemplate _custom = null!;
    IReadOnlyList<ScreenTemplate> _templates = null!;
    ScreenTemplate[] _result = null!;

    void Establish()
    {
        _custom = new ScreenTemplate("custom", "parent.body", [])
        {
            Metadata = new TemplateMetadata("Acme.Workspace", "Acme/Dispatch")
        };
        _templates =
        [
            _custom,
            new ScreenTemplate("wrongScope", null, []) { Metadata = new TemplateMetadata(Scopes: [TemplateScope.Slice]) },
            new ScreenTemplate("wrongSlot", "other.body", []),
            new ScreenTemplate("legacy", "body", []),
            new ScreenTemplate("shell", null, []) { Metadata = new TemplateMetadata("ApplicationShell") }
        ];
    }

    void Because() => _result = [.. TemplateApplicability.FilterScreenTemplates(_templates, TemplateScope.Subfeature, new TemplateContainer("parent", [new Slot("body")]))];

    [Fact] void should_preserve_browse_order() => string.Join(',', _result.Select(template => template.Name)).ShouldEqual("custom,legacy");
    [Fact] void should_preserve_the_inherited_definition() => ReferenceEquals(_result[0], _custom).ShouldBeTrue();
    [Fact] void should_preserve_unknown_package_categories() => _result[0].Metadata!.Category.ShouldEqual("Acme/Dispatch");
}
