// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Session;

namespace Cratis.Scene.Design.for_DesignSessionReducer;

public class when_folding_events : Specification
{
    DesignSession _session = null!;
    DesignSession _seeded = null!;

    void Because()
    {
        var subject = new DesignSubject(DesignSubjectKind.Story, "story-1");
        _session = DesignSessionReducer.FoldAll(
        [
            new DesignSessionStarted("s1", subject, DesignMode.Screens, "ada", ["Page"]),
            new ScreenRevisionRecorded("r1", "Home", "first", [], "ada"),
            new ScreenRevisionRecorded("r2", "Home", "second", [], "ada"),
            new ScreenReverted("r3", "Home", "r1", "grace"),
            new VariationsProposed("g1", "Home", [new ProposedVariation("c1", "one"), new ProposedVariation("c2", "two")]),
            new VariationChosen("g1", "c2", "r4", "ada"),
        ])!;
        _seeded = DesignSessionReducer.FoldAll(DesignSessions.Seed(_session, new DesignSessionSeed("issue-1", new DesignSubject(DesignSubjectKind.Issue, "i1"), "grace")))!;
    }

    [Fact] void should_keep_every_revision() => _session.Revisions.Select(revision => revision.Id).ToList().ShouldEqual("r1", "r2", "r3", "r4");

    [Fact] void should_make_the_chosen_variation_the_current_revision() => _session.CurrentRevisionOf("Home")!.Text.ShouldEqual("two");

    [Fact] void should_make_a_revert_a_new_revision_that_says_what_it_restores() => _session.Revisions[2].RestoredFrom.ShouldEqual("r1");

    [Fact] void should_say_which_revision_a_revision_was_made_from() => _session.Revisions[2].BasisRevision.ShouldEqual("r2");

    [Fact] void should_carry_the_template_set() => _session.TemplateSet!.ToList().ShouldEqual("Page");

    [Fact] void should_copy_the_current_revision_of_each_screen_when_seeding() => _seeded.Revisions.Select(revision => revision.Text).ToList().ShouldEqual("two");

    [Fact] void should_link_a_seeded_revision_to_the_one_it_was_copied_from() => _seeded.Revisions[0].Origin.ShouldEqual(new RevisionOrigin("s1", "r4"));

    [Fact] void should_key_a_seeded_session_to_its_own_subject() => _seeded.Subject.Kind.ShouldEqual(DesignSubjectKind.Issue);

    [Fact] void should_remember_the_session_it_was_seeded_from() => _seeded.SeededFrom.ShouldEqual("s1");

    [Fact] void should_declare_every_event_as_a_chronicle_event_type() =>
        DesignSessionEvents.Types.Values.All(type => type.GetCustomAttributes(typeof(Cratis.Chronicle.Events.EventTypeAttribute), false).Length == 1).ShouldBeTrue();
}
