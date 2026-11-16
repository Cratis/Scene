// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward.for_SampleDataConverter;

public class when_two_packs_derive_the_same_scene_id : given.a_translated_application
{
    const string Source =
        """
        sample data NordicDemo
          shape Customer
            row
              name = "A"

        sample data nordicDemo
          shape Customer
            row
              name = "B"

        module Crm
          feature Customers
            slice StateView CustomerList
              readmodel Customer
                name String
        """;

    IReadOnlyList<ConversionFinding> _findings = null!;

    void Because()
    {
        Translate(Source);
        _findings = [.. ApplicationFindings.ForApplication(_application)];
    }

    [Fact] void should_report_one_finding() => _findings.Count.ShouldEqual(1);
    [Fact] void should_report_it_as_invalid_sample_data() => _findings[0].Kind.ShouldEqual(ConversionFindingKind.SampleDataInvalid);
    [Fact] void should_say_the_ids_collide() => _findings[0].Message.ShouldContain("derive the same id");
}
