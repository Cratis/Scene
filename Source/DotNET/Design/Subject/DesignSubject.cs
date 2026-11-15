// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cratis.Scene.Design;

/// <summary>
/// The thing a design session is keyed to. A session knows nothing about what a story, an issue or an application is; the host names the
/// subject, so the same session serves every host and several subjects in one host.
/// </summary>
/// <param name="Kind">The kind of subject.</param>
/// <param name="Id">Its id, which the host owns.</param>
public record DesignSubject(DesignSubjectKind Kind, string Id)
{
    /// <summary>
    /// Gets the subject's stable key: kind and id, such as <c language="text">story:7f2</c>.
    /// </summary>
    [JsonIgnore]
    public string Key => $"{JsonNamingPolicy.CamelCase.ConvertName(Kind.ToString())}:{Id}";
}
