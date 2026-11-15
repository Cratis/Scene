// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.AI.Agents;
using Cratis.AI.Conversations;
using Cratis.AI.LanguageModels;
using Cratis.Scene.Design.AI.DesignSystem;
using Cratis.Scene.Design.AI.Turns;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Cratis.Scene.Design.AI.given;

/// <summary>
/// A design system turn over a scripted model, with the sources a host would gather.
/// </summary>
public class a_design_system_turn : Specification
{
    protected ScriptedChatClient _model = null!;
    protected IAIChatClients _clients = null!;
    protected IAgentExecution _execution = null!;
    protected IDesignSources _sources = null!;
    protected DesignAIOptions _options = null!;
    protected DesignSystemTurn _turn = null!;
    protected List<DesignTurnProgress> _progress = null!;
    protected DesignSystemResult _result = null!;
    protected DesignSourcesRequest? _asked;

    void Establish()
    {
        _model = new();
        _clients = Substitute.For<IAIChatClients>();
        _clients.For(Arg.Any<LanguageModelPurpose>()).Returns(_model);
        _execution = Substitute.For<IAgentExecution>();
        _execution.As(Arg.Any<LanguageModelPurpose>(), Arg.Any<IDictionary<string, string>?>()).Returns(Substitute.For<IDisposable>());
        _sources = Substitute.For<IDesignSources>();
        _sources.Gather(Arg.Any<DesignSourcesRequest>(), Arg.Any<CancellationToken>()).Returns(callInfo =>
        {
            _asked = callInfo.Arg<DesignSourcesRequest>();
            return Task.FromResult(Gathered());
        });
        _options = new() { MaximumFailedWrites = 3, MaximumIterations = 12 };
        _turn = new(_clients, _execution, _sources, Options.Create(_options), NullLogger<DesignSystemTurn>.Instance);
        _progress = [];
    }

    protected virtual DesignSourceSet Gathered() => new([Brand.File("src/styles/app.css", Brand.Stylesheet), new(DesignSourceKind.BrandFile, "uploaded brand file", "voice.md", Brand.BrandNotes)], []);

    protected async Task Run(DesignSystemRequest request) =>
        _result = await _turn.Run(request, new SynchronousProgress<DesignTurnProgress>(_progress));

    protected string ToolAnswer(string tool, int index = 0) => _model.AnswersOf(tool)[index];
}
