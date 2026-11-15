// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// A question the catalogue answers: a list of one kind of thing, or the description of one. The AI read tools call these, so a model reads what it
/// needs on demand instead of being handed the whole catalogue.
/// </summary>
/// <remarks>
/// <c language="text">What</c> is one of <c language="text">components</c>, <c language="text">component</c>, <c language="text">templates</c>,
/// <c language="text">template</c>, <c language="text">tokens</c>, <c language="text">token</c>, <c language="text">designComponents</c>,
/// <c language="text">designComponent</c>, <c language="text">themes</c>, <c language="text">profile</c>, <c language="text">words</c>,
/// <c language="text">shapes</c>, <c language="text">shape</c>, <c language="text">queries</c>, <c language="text">query</c>,
/// <c language="text">commands</c> or <c language="text">command</c>.
/// </remarks>
/// <param name="What">What is asked about.</param>
/// <param name="Category">Limits components or tokens to a category.</param>
/// <param name="FitsTemplate">Limits components to those that fit a template.</param>
/// <param name="FitsOutlet">Limits components to those that fit an outlet of that template.</param>
/// <param name="Search">Limits components to those that mention the text.</param>
/// <param name="Name">The name of the thing to describe.</param>
/// <param name="Address">The address of the token to describe.</param>
public record DesignCatalogueQuery(
    string What,
    string? Category = null,
    string? FitsTemplate = null,
    string? FitsOutlet = null,
    string? Search = null,
    string? Name = null,
    string? Address = null);
