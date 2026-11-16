// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Design.for_SharedFixtures;
using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.for_DesignOperations;

public class when_applying_operations : Specification
{
    DesignApplyResult _freeStyling = null!;
    DesignApplyResult _outsideTheSet = null!;
    DesignApplyResult _template = null!;

    void Because()
    {
        var workspace = DesignCorpus.Workspace("invoices");
        _freeStyling = DesignOperations.Apply(
            workspace,
            [new SetOperation("pay", "backgroundColor", JsonSerializer.SerializeToElement("red"), "InvoiceDetails")],
            DesignContext.Create(DesignCorpus.Input("base")));
        _outsideTheSet = DesignOperations.Apply(
            DesignCorpus.Workspace("empty"),
            [new AddScreenOperation("Orders", "DashboardScreen")],
            DesignContext.Create(DesignCorpus.Input("constrained")));
        _template = DesignOperations.Apply(
            DesignCorpus.Workspace("noProfile"),
            [
                new AddTemplateOperation("Wizard", [new DesignSlot("steps"), new DesignSlot("footer")]),
                new InsertOperation("footer", "test:button", null, "Wizard", null, null, new Dictionary<string, JsonElement> { ["label"] = JsonSerializer.SerializeToElement("Next") }),
            ],
            DesignContext.Create(DesignCorpus.Input("base")));
    }

    [Fact] void should_refuse_free_styling() => _freeStyling.Outcomes[0].Code.ShouldEqual(DesignRefusalCode.FreeStylingNotAllowed);

    [Fact] void should_change_nothing_for_a_refusal() => DesignCorpus.Write(_freeStyling.Workspace)!.ToJsonString().ShouldEqual(DesignCorpus.Write(DesignCorpus.Workspace("invoices"))!.ToJsonString());

    [Fact] void should_offer_to_propose_free_styling_to_the_design_system() => _freeStyling.Outcomes[0].Alternatives!.Any(alternative => alternative.Proposal?.Kind == "token").ShouldBeTrue();

    [Fact] void should_refuse_a_template_outside_the_set() => _outsideTheSet.Outcomes[0].Code.ShouldEqual(DesignRefusalCode.TemplateNotInSet);

    [Fact] void should_offer_the_templates_of_the_set() => ((AddScreenOperation)_outsideTheSet.Outcomes[0].Alternatives![0].Operations![0]).Template.ShouldEqual("ListScreen");

    [Fact] void should_add_the_template_in_template_mode() => _template.Outcomes[0].Applied.ShouldBeTrue();

    [Fact] void should_put_content_into_the_template_through_a_scene_edit_in_its_scope() => _template.Outcomes[1].SceneEdits[0].Scope.Name.ShouldEqual("Wizard");
}
