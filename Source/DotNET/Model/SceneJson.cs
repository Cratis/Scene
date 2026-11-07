// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Model;

/// <summary>
/// The JSON settings that read what the TypeScript engine writes. A polymorphic Scene type - an outlet item, a guard
/// condition - names its type in a <c language="json">kind</c> property, and JavaScript writes properties in whatever order
/// the object was built, so <c language="json">kind</c> is often not first. <c language="csharp">System.Text.Json</c> only
/// accepts that with <c language="csharp">AllowOutOfOrderMetadataProperties</c> (from .NET 9), which <see cref="Options"/> and
/// <see cref="Configure"/> turn on.
/// </summary>
public static class SceneJson
{
    /// <summary>
    /// Gets the options to read and write Scene models with: web defaults (camel case), enumerations as camel-case text, and
    /// a type discriminator accepted wherever it appears in an object.
    /// </summary>
    public static JsonSerializerOptions Options { get; } = CreateOptions();

    /// <summary>
    /// Makes options of a host's own read Scene models written by TypeScript: a type discriminator is accepted wherever it
    /// appears in an object.
    /// </summary>
    /// <param name="options">The options, which are changed in place; they must not be in use yet.</param>
    /// <returns>The same options, for chaining.</returns>
    /// <remarks>
    /// <c language="csharp">AllowOutOfOrderMetadataProperties</c> exists from .NET 9. On .NET 8 the options are
    /// returned as they are, and an item must still name its <c language="json">kind</c> first.
    /// </remarks>
    public static JsonSerializerOptions Configure(JsonSerializerOptions options)
    {
#if NET9_0_OR_GREATER
        options.AllowOutOfOrderMetadataProperties = true;
#endif
        return options;
    }

    static JsonSerializerOptions CreateOptions()
    {
        var options = Configure(new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
        });
        options.MakeReadOnly(populateMissingResolver: true);
        return options;
    }
}
