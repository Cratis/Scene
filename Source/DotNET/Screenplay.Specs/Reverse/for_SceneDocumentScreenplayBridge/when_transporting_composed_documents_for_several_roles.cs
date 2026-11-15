// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneDocumentScreenplayBridge;

// The golden case for the UI Screenplay 4.120 can say: saved as Scene, exported, printed, compiled, imported and reopened,
// each role's document says exactly what it said - without the preservation carrier and without a screen warning. The
// pinned Stage carries every one of these constructs into its Scene, so Stage is never refused a translation for them.
public class when_transporting_composed_documents_for_several_roles : given.composed_scene_documents
{
    void Because() => Transport((Guid.NewGuid().ToString(), "Operator", Operator), (Guid.NewGuid().ToString(), "Auditor", Auditor));

    [Fact] void should_have_no_export_warnings() => _warnings.ShouldBeEmpty();
    [Fact] void should_not_use_the_preservation_carrier() => _source.ShouldNotContain(ScreenplaySceneDocumentReferences.Prefix);
    [Fact] void should_compile_without_errors() => _import.Compilation.Success.ShouldBeTrue();
    [Fact] void should_not_warn_about_screens() => _import.Compilation.Diagnostics.Where(diagnostic => diagnostic.Code == ScreenplayImportDiagnosticCodes.ScreenConstructNotCarried).ShouldBeEmpty();
    [Fact] void should_declare_the_extra_layout() => _source.ShouldContain("layout OperatorShell");
    [Fact] void should_say_the_screen_contributions() => _source.ShouldContain("contribute to Navigation order 1");
    [Fact] void should_say_the_exposures() => _source.ShouldContain("exposure for MasterDetail");
    [Fact] void should_say_the_instance_contributions() => _source.ShouldContain("instance Operator");
    [Fact] void should_say_the_template_content() => _source.ShouldContain("content list");
    [Fact] void should_reopen_a_document_per_role() => _import.CustomCode.Screens.Select(screen => screen.RoleName).ShouldContainOnly("Operator", "Auditor");
    [Fact] void should_reopen_the_operator_document() => FirstDifference(Operator, Reopened("Operator").Document).ShouldBeNull();
    [Fact] void should_reopen_the_auditor_document() => FirstDifference(Auditor, Reopened("Auditor").Document).ShouldBeNull();
}
