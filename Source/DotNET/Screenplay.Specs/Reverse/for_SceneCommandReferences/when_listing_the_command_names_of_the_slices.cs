// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Reverse.for_SceneCommandReferences;

public class when_listing_the_command_names_of_the_slices : Specification
{
    static readonly Guid _registered = Guid.NewGuid();
    static readonly Guid _repeated = Guid.NewGuid();
    static readonly Guid _unnamed = Guid.NewGuid();

    IReadOnlyDictionary<Guid, string> _names = null!;

    void Because() => _names = SceneCommandReferences.CommandNames(
    [
        (_registered, "RegisterOrder"),
        (_repeated, "CancelOrder"),
        (_repeated, "ReturnOrder"),
        (_unnamed, null),
        (Guid.NewGuid(), string.Empty)
    ]);

    [Fact] void should_name_the_command_of_a_slice() => _names[_registered].ShouldEqual("RegisterOrder");
    [Fact] void should_keep_the_first_name_of_a_slice_listed_twice() => _names[_repeated].ShouldEqual("CancelOrder");
    [Fact] void should_leave_out_a_slice_with_no_command_name() => _names.ContainsKey(_unnamed).ShouldBeFalse();
    [Fact] void should_list_only_the_slices_with_a_name() => _names.Count.ShouldEqual(2);
}
