// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

public class when_transporting_documents_for_several_roles : given.a_scene_document_transport
{
    readonly string _operator = Document("operator-panel", "Operator panel", "core:operatorPanel");
    readonly string _auditor = Document("auditor-panel", "Auditor panel", "core:auditorPanel");

    void Because() => Transport((Guid.NewGuid().ToString(), "Operator", _operator), (Guid.NewGuid().ToString(), "Auditor", _auditor));

    [Fact] void should_have_no_export_warnings() => _warnings.ShouldBeEmpty();
    [Fact] void should_not_use_the_preservation_carrier() => _source.ShouldNotContain(ScreenplaySceneDocumentReferences.Prefix);
    [Fact] void should_plan_a_screen_per_role() => _plan.Screens.Select(screen => screen.Name).ShouldContainOnly("Operator", "Auditor");
    [Fact] void should_plan_the_operator_component_under_its_exact_id() => PlannedElement("Operator", "operator-panel").ShouldNotBeNull();
    [Fact] void should_plan_the_auditor_component_under_its_exact_id() => PlannedElement("Auditor", "auditor-panel").ShouldNotBeNull();
    [Fact] void should_reopen_a_document_per_role() => _import.CustomCode.Screens.Select(screen => screen.RoleName).ShouldContainOnly("Operator", "Auditor");
    [Fact] void should_reopen_the_operator_document() => FirstDifference(_operator, Reopened("Operator").Document).ShouldBeNull();
    [Fact] void should_reopen_the_auditor_document() => FirstDifference(_auditor, Reopened("Auditor").Document).ShouldBeNull();

    static string Document(string id, string name, string component) =>
        "{\"layouts\":[{\"name\":\"StudioScreen\",\"slots\":[{\"name\":\"content\"}]}],\"screenTemplates\":[],\"dialogTemplates\":[]," +
        $"\"screens\":[{{\"name\":\"Screen\",\"layout\":\"StudioScreen\",\"slotContent\":{{\"content\":[{{\"id\":\"{id}\",\"name\":\"{name}\",\"componentName\":\"{component}\",\"properties\":{{\"title\":\"{name}\"}},\"slots\":{{}}}}]}},\"forms\":[],\"contributions\":[]}}]," +
        "\"exposures\":[],\"instanceContributions\":[]}";
}
