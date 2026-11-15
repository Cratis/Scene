// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;
using Cratis.Screenplay;

namespace Cratis.Scene.Screenplay.DesignSystems.for_DesignSystemConverter;

public class when_the_application_declares_no_design_system : Specification
{
    DesignSystem? _result;

    void Because() => _result = DesignSystemConverter.Convert(new ScreenplayCompiler().Parse("module Shop\n  feature Orders\n").Value!);

    [Fact] void should_convert_to_nothing() => _result.ShouldBeNull();
}
