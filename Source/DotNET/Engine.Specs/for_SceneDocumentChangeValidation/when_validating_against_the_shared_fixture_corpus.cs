// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing.for_SceneDocumentChangeValidation;

public class when_validating_against_the_shared_fixture_corpus : Specification
{
    IReadOnlyList<DocumentChangeFixtures.FixtureCase> _cases = null!;
    List<(DocumentChangeFixtures.FixtureCase Case, SceneDocumentChangeResult Result)> _results = null!;

    void Establish() => _cases = DocumentChangeFixtures.Load();

    void Because() => _results = [.. _cases.Select(fixtureCase => (
        fixtureCase,
        SceneDocumentChangeValidation.Validate(fixtureCase.Scope, fixtureCase.Previous, fixtureCase.Submitted, fixtureCase.References)))];

    [Fact]
    void should_have_cases_that_are_accepted_and_cases_that_are_refused()
    {
        _cases.Count(fixtureCase => fixtureCase.Accepted).ShouldBeGreaterThan(10);
        _cases.Count(fixtureCase => !fixtureCase.Accepted).ShouldBeGreaterThan(10);
    }

    [Fact]
    void should_accept_exactly_the_changes_the_corpus_allows()
    {
        foreach (var (fixtureCase, result) in _results)
        {
            (fixtureCase.Name, result.IsValid).ShouldEqual((fixtureCase.Name, fixtureCase.Accepted));
        }
    }

    [Fact]
    void should_refuse_for_exactly_the_reasons_the_corpus_gives()
    {
        foreach (var (fixtureCase, result) in _results)
        {
            var codes = result.Violations.Select(violation => violation.CodeName).Distinct().Order(StringComparer.Ordinal);
            (fixtureCase.Name, string.Join(',', codes)).ShouldEqual((fixtureCase.Name, string.Join(',', fixtureCase.Codes)));
        }
    }

    [Fact]
    void should_say_why_in_a_message_for_every_refusal()
    {
        foreach (var (fixtureCase, result) in _results.Where(entry => !entry.Result.IsValid))
        {
            (fixtureCase.Name, string.IsNullOrWhiteSpace(result.Message)).ShouldEqual((fixtureCase.Name, false));
        }
    }
}
