// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// Who authored a template and what must accompany it when it is reused.
/// </summary>
/// <param name="Author">The person or organization that authored the template.</param>
/// <param name="Url">An absolute <c language="csharp">https</c> URL where the template's source or documentation lives.</param>
/// <param name="Notice">An attribution notice a license requires to travel with the template.</param>
public record TemplateAttribution(string Author, string? Url = null, string? Notice = null);
