// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// Options a property editor takes.
/// </summary>
/// <param name="Multiline">Whether text spans lines.</param>
/// <param name="Placeholder">Hint text.</param>
/// <param name="Unit">The unit shown beside a number.</param>
/// <param name="Step">The step of a number.</param>
/// <param name="Kinds">The kinds offered.</param>
/// <param name="Reference">What a reference editor offers.</param>
/// <param name="FieldKinds">The field kinds offered.</param>
/// <param name="TokensOnly">Whether only design tokens are offered.</param>
public record PropertyEditorOptions(
    bool? Multiline = null,
    string? Placeholder = null,
    string? Unit = null,
    double? Step = null,
    IReadOnlyList<string>? Kinds = null,
    ReferenceFilterDescriptor? Reference = null,
    IReadOnlyList<string>? FieldKinds = null,
    bool? TokensOnly = null);
