// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.AI.Conversations;
using Cratis.AI.LanguageModels;
using Microsoft.Extensions.AI;

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// The tool loop every turn runs: a chat client of Cratis.AI for a purpose, wrapped with Microsoft.Extensions.AI's function invocation, called until
/// the model stops asking for tools or a tool ends the loop.
/// </summary>
internal static class ToolLoop
{
    /// <summary>
    /// Runs the loop.
    /// </summary>
    /// <param name="clients">The chat clients of Cratis.AI.</param>
    /// <param name="purpose">The purpose the model talks as.</param>
    /// <param name="messages">The conversation to start from.</param>
    /// <param name="tools">The tools.</param>
    /// <param name="maximumIterations">The most model requests the loop makes.</param>
    /// <param name="cancellationToken">A token to cancel it.</param>
    /// <returns>The last response of the model.</returns>
    public static async Task<ChatResponse> Run(IAIChatClients clients, LanguageModelPurpose purpose, IList<ChatMessage> messages, IList<AITool> tools, int maximumIterations, CancellationToken cancellationToken)
    {
        var client = new ChatClientBuilder(clients.For(purpose))
            .UseFunctionInvocation(null, function =>
            {
                function.MaximumIterationsPerRequest = maximumIterations;
                function.AllowConcurrentInvocation = false;
            })
            .Build();
        return await client.GetResponseAsync(messages, new ChatOptions { Tools = tools }, cancellationToken);
    }

    /// <summary>
    /// Ends the loop: the tool that calls it is the last the model gets to call.
    /// </summary>
    public static void End()
    {
        if (FunctionInvokingChatClient.CurrentContext is { } context)
        {
            context.Terminate = true;
        }
    }

    /// <summary>
    /// Gets whether the loop stopped with a tool call that was not answered: it ran out of iterations.
    /// </summary>
    /// <param name="response">The last response.</param>
    /// <returns><see langword="true"/> when it ran out.</returns>
    public static bool RanOut(ChatResponse response) => response.Messages.LastOrDefault()?.Contents.OfType<FunctionCallContent>().Any() == true;
}
