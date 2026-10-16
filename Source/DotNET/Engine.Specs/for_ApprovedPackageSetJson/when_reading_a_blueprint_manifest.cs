// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;
using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.for_ApprovedPackageSetJson;

public class when_reading_a_blueprint_manifest : given.a_package_set_document
{
    const string Manifest =
        "{ \"name\": \"Acme.Blueprint.Crm\", \"version\": \"1.0.0\", \"kind\": \"Blueprint\"," +
        " \"dependencies\": [{ \"name\": \"Cratis.Blueprint.Default\", \"versionRange\": \"^1.0.0\" }]," +
        " \"screenTemplates\": [\"CrmLeadList\"], \"dialogTemplates\": []," +
        " \"sampleData\": [{ \"id\": \"crm-en\", \"title\": \"CRM\", \"locale\": \"en-GB\", \"path\": \"sampleData/crm-en.json\" }]," +
        " \"blueprint\": { \"domain\": \"crm\", \"description\": \"Leads.\", \"thumbnail\": \"thumbnails/crm.svg\"," +
        " \"screenSet\": [{ \"name\": \"crm.leads\", \"title\": \"Leads\", \"description\": \"Leads.\", \"template\": \"CrmLeadList\" }] } }";

    ApprovedPackageSetReadResult _result = null!;
    string _written = null!;

    void Because()
    {
        _result = ApprovedPackageSetJson.Read(WithPackage(Manifest, GoodModule), ["core"]);
        _written = ApprovedPackageSetJson.Write(_result.Set!);
    }

    [Fact] void should_accept_the_manifest_as_published() => _result.Succeeded.ShouldBeTrue();

    [Fact] void should_keep_the_kind_and_templates() => (_result.Set!.Packages.Single().Manifest.Kind, string.Join(',', _result.Set.Packages.Single().Manifest.ScreenTemplates)).ShouldEqual((PackageKind.Blueprint, "CrmLeadList"));

    [Fact] void should_leave_the_sample_data_out_of_the_runtime_document() => _written.ShouldNotContain("sampleData");

    [Fact] void should_leave_the_gallery_metadata_out_of_the_runtime_document() => _written.ShouldNotContain("\"blueprint\"");
}
