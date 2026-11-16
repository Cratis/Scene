// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.AI.Agents;
using Cratis.AI.Conversations;
using Cratis.AI.LanguageModels;
using Cratis.Scene.Design.AI.Turns;
using Cratis.Scene.Design.Operations;
using Cratis.Scene.Design.Session;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Cratis.Scene.Design.AI.given;

/// <summary>
/// A design turn over a scripted model, for a design of the shop.
/// </summary>
public class a_design_turn : Specification
{
    protected ScriptedChatClient _model = null!;
    protected IAIChatClients _clients = null!;
    protected IAgentExecution _execution = null!;
    protected DesignAIOptions _options = null!;
    protected DesignTurn _turn = null!;
    protected List<DesignTurnProgress> _progress = null!;
    protected DesignTurnResult _result = null!;

    void Establish()
    {
        _model = new();
        _clients = Substitute.For<IAIChatClients>();
        _clients.For(Arg.Any<LanguageModelPurpose>()).Returns(_model);
        _execution = Substitute.For<IAgentExecution>();
        _execution.As(Arg.Any<LanguageModelPurpose>(), Arg.Any<IDictionary<string, string>?>()).Returns(Substitute.For<IDisposable>());
        _options = new() { MaximumFailedWrites = 3, MaximumIterations = 12 };
        _turn = new(_clients, _execution, Options.Create(_options), NullLogger<DesignTurn>.Instance);
        _progress = [];
    }

    protected static DesignTurnRequest Request(DesignSession session, string instruction, DesignFocus? selection = null, IReadOnlyList<DesignImage>? images = null) =>
        new("turn-1", session, instruction, "ada", selection, images);

    protected async Task Run(DesignTurnRequest request, DesignHostContext? host = null) =>
        _result = await _turn.Run(request, host ?? Shop.Host(), new SynchronousProgress<DesignTurnProgress>(_progress));

    protected IEnumerable<T> Events<T>() => _result.Events.OfType<T>();

    protected string ToolAnswer(string tool, int index = 0) => _model.AnswersOf(tool)[index];
}
