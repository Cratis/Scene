// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using Microsoft.Extensions.AI;

namespace Cratis.Scene.Design.AI.given;

/// <summary>
/// A chat client that plays a script: each request is answered with the next step, a set of tool calls or a closing sentence, so a turn is deterministic.
/// </summary>
public class ScriptedChatClient : IChatClient
{
    readonly Queue<Func<IReadOnlyList<ChatMessage>, ChatMessage>> _script = new();
    int _calls;

    /// <summary>
    /// Gets the conversation as each request saw it.
    /// </summary>
    public List<IReadOnlyList<ChatMessage>> Requests { get; } = [];

    /// <summary>
    /// Gets the tools the requests offered.
    /// </summary>
    public IList<AITool> Tools { get; private set; } = [];

    /// <summary>
    /// Makes the next answer a set of tool calls.
    /// </summary>
    /// <param name="calls">The calls, each a tool and its arguments.</param>
    /// <returns>The client, for chaining.</returns>
    public ScriptedChatClient Calls(params (string Tool, object Arguments)[] calls)
    {
        _script.Enqueue(_ => new ChatMessage(ChatRole.Assistant, [.. calls.Select(call => (AIContent)new FunctionCallContent($"call-{Interlocked.Increment(ref _calls)}", call.Tool, Arguments(call.Arguments)))]));
        return this;
    }

    /// <summary>
    /// Makes the next answer a set of tool calls decided by what the model has been told so far.
    /// </summary>
    /// <param name="next">What to call, given the conversation.</param>
    /// <returns>The client, for chaining.</returns>
    public ScriptedChatClient Then(Func<IReadOnlyList<ChatMessage>, (string Tool, object Arguments)> next)
    {
        _script.Enqueue(messages =>
        {
            var (tool, arguments) = next(messages);
            return new ChatMessage(ChatRole.Assistant, [new FunctionCallContent($"call-{Interlocked.Increment(ref _calls)}", tool, Arguments(arguments))]);
        });
        return this;
    }

    /// <summary>
    /// Makes the next answer a sentence.
    /// </summary>
    /// <param name="text">The sentence.</param>
    /// <returns>The client, for chaining.</returns>
    public ScriptedChatClient Says(string text)
    {
        _script.Enqueue(_ => new ChatMessage(ChatRole.Assistant, text));
        return this;
    }

    /// <summary>
    /// Makes the model fail on the next request.
    /// </summary>
    /// <param name="exception">What it fails with.</param>
    /// <returns>The client, for chaining.</returns>
    public ScriptedChatClient Fails(Exception exception)
    {
        _script.Enqueue(_ => throw exception);
        return this;
    }

    /// <summary>
    /// Gets what a tool answered, by the order it was called.
    /// </summary>
    /// <param name="tool">The tool.</param>
    /// <returns>The answers.</returns>
    public IReadOnlyList<string> AnswersOf(string tool)
    {
        var last = Requests.Count == 0 ? [] : Requests[^1];
        var calls = last.SelectMany(message => message.Contents.OfType<FunctionCallContent>()).Where(call => call.Name == tool).Select(call => call.CallId).ToHashSet();
        return [.. last.SelectMany(message => message.Contents.OfType<FunctionResultContent>()).Where(result => calls.Contains(result.CallId)).Select(result => result.Result?.ToString() ?? string.Empty)];
    }

    /// <inheritdoc/>
    public Task<ChatResponse> GetResponseAsync(IEnumerable<ChatMessage> messages, ChatOptions? options = null, CancellationToken cancellationToken = default)
    {
        var snapshot = messages.ToList();
        Requests.Add(snapshot);
        Tools = options?.Tools ?? [];
        if (_script.Count == 0)
        {
            throw new InvalidOperationException("The script has no answer for request " + Requests.Count + ".");
        }

        return Task.FromResult(new ChatResponse(_script.Dequeue()(snapshot)));
    }

    /// <inheritdoc/>
    public IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(IEnumerable<ChatMessage> messages, ChatOptions? options = null, CancellationToken cancellationToken = default) =>
        throw new NotSupportedException();

    /// <inheritdoc/>
    public object? GetService(Type serviceType, object? serviceKey = null) => null;

    /// <inheritdoc/>
    public void Dispose()
    {
    }

    static Dictionary<string, object?> Arguments(object arguments) =>
        JsonSerializer.SerializeToElement(arguments).EnumerateObject().ToDictionary(property => property.Name, property => (object?)property.Value.Clone());
}
