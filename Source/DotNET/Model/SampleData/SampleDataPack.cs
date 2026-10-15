// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.SampleData;

/// <summary>
/// A named dataset used by design-time editing and preview, owned by a blueprint or by the user. A pack is
/// never part of a running application: Stage production builds do not include or resolve it.
/// </summary>
/// <param name="Id">The pack's stable identity, which selections and bindings refer to.</param>
/// <param name="Title">The display name. A blueprint pack's selector label is <c language="csharp">&lt;Blueprint&gt; · &lt;title&gt;</c>.</param>
/// <param name="Locale">The BCP 47 locale tag of the data (<c language="csharp">nb-NO</c>, <c language="csharp">en-GB</c>); generated gap-filling data follows it.</param>
/// <param name="Owner"><c language="csharp">blueprint:&lt;id&gt;</c> for a pack a blueprint ships, or <c language="csharp">user</c> for the author's own.</param>
/// <param name="Sets">The rows per shape.</param>
public record SampleDataPack(string Id, string Title, string Locale, string Owner, IReadOnlyList<SampleDataSet> Sets);
