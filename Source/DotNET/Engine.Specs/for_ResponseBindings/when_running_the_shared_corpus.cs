// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Cratis.Scene.Engine.Bindings;
using Cratis.Scene.Model.Common;
using Cratis.Scene.Model.Interactions;

namespace Cratis.Scene.Engine.for_ResponseBindings;

public class when_running_the_shared_corpus : Specification
{
    JsonElement _corpus;
    readonly JsonSerializerOptions _options = new(JsonSerializerDefaults.Web);

    void Establish()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx"))) directory = directory.Parent;
        _corpus = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory!.FullName, "command-response-fixtures.json"))).RootElement;
    }

    [Fact]
    void should_validate_every_shared_binding()
    {
        foreach (var entry in _corpus.GetProperty("cases").EnumerateArray())
        {
            var contracts = Substitute.For<IResponseValidationContracts>();
            contracts.CommandResponse("create").Returns(entry.TryGetProperty("response", out var response) ? response.Deserialize<ResponseContract>(_options) : null);
            contracts.TargetType(Arg.Any<InteractionAction>(), Arg.Any<ResponseOperand>()).Returns(entry.TryGetProperty("target", out var target) ? target.Deserialize<ResponseValueType>(_options) : null);
            var binding = new BindingExpression(entry.GetProperty("path").GetString()!, BindingSourceKind.CommandResponse, Mode: entry.TryGetProperty("mode", out _) ? BindingMode.TwoWay : null, ExpectedValueType: entry.TryGetProperty("expectedValueType", out var expected) ? expected.GetString() : null);
            var action = new SetStateAction("id", binding);
            (ResponseBindings.Validate(new("form", Command: "create", OnSubmit: [action]), contracts).Count == 0).ShouldEqual(entry.GetProperty("valid").GetBoolean());
        }
    }

    [Fact]
    void should_validate_every_shared_lexical_scope()
    {
        var contracts = Substitute.For<IResponseValidationContracts>();
        contracts.CommandResponse("known").Returns(new ResponseContract("value", new("string")));
        contracts.TargetType(Arg.Any<InteractionAction>(), Arg.Any<ResponseOperand>()).Returns(new ResponseValueType("string"));
        foreach (var entry in _corpus.GetProperty("scopes").EnumerateArray())
        {
            var actions = entry.GetProperty("actions").EnumerateArray().Select(ReadAction).ToArray();
            ResponseBindings.Validate(new("actions", Actions: actions), contracts).Count.ShouldEqual(entry.GetProperty("diagnostics").GetInt32());
        }
    }

    InteractionAction ReadAction(JsonElement entry)
    {
        InteractionAction action = entry.GetProperty("kind").GetString() switch
        {
            "ExecuteCommand" => new ExecuteCommandAction(entry.GetProperty("command").GetString()!),
            "SetState" => new SetStateAction(entry.GetProperty("target").GetString()!, new(entry.GetProperty("value").GetProperty("path").GetString()!, BindingSourceKind.CommandResponse)),
            "RefreshQuery" => new RefreshQueryAction(entry.GetProperty("query").GetString()!),
            _ => throw new InvalidOperationException("Unknown fixture action")
        };
        return action with { OnSuccess = ReadContinuation(entry, "onSuccess"), OnFailure = ReadContinuation(entry, "onFailure"), OnResult = ReadContinuation(entry, "onResult") };
    }

    InteractionAction[] ReadContinuation(JsonElement entry, string name) => entry.TryGetProperty(name, out var actions) ? actions.EnumerateArray().Select(ReadAction).ToArray() : [];

    [Fact]
    void should_reject_response_reads_outside_success()
    {
        var contracts = Substitute.For<IResponseValidationContracts>();
        var action = new SetStateAction("id", new("", BindingSourceKind.CommandResponse));
        ResponseBindings.Validate(new("actions", Actions: [action]), contracts).Count.ShouldEqual(1);
    }
}
