// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.AI.DesignSystem.for_DesignSystemPhases;

public class when_asking_for_the_steps : Specification
{
    [Fact] void should_establish_in_four_steps_without_a_capture() => DesignSystemPhases.EstablishingSteps(false).ShouldEqual(DesignSystemPhases.Colors, DesignSystemPhases.TypeAndSpacing, DesignSystemPhases.Components, DesignSystemPhases.Words);
    [Fact] void should_start_with_the_capture_when_there_is_one() => DesignSystemPhases.EstablishingSteps(true)[0].ShouldEqual(DesignSystemPhases.RunningApp);
    [Fact] void should_have_an_instruction_for_every_step() => DesignSystemPhases.EstablishingSteps(true).Append(DesignSystemPhases.Revise).ShouldEachConformTo(step => DesignSystemPhases.InstructionFor(step).Length > 20);
    [Fact] void should_name_every_step() => DesignSystemPhases.EstablishingSteps(true).Append(DesignSystemPhases.Revise).ShouldEachConformTo(step => DesignSystemPhases.NameOf(step).Length > 0);
    [Fact] void should_ask_for_the_conflicts_to_be_named() => DesignSystemPhases.InstructionFor(DesignSystemPhases.Colors).ShouldContain("conflict");
    [Fact] void should_refuse_a_step_it_does_not_have() => Catch.Exception(() => DesignSystemPhases.InstructionFor("nope")).ShouldBeOfExactType<InvalidOperationException>();
}
