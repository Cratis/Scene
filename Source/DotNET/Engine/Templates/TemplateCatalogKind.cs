// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// Which kind of template a catalog entry describes.
/// </summary>
public enum TemplateCatalogKind
{
    /// <summary>An application shell.</summary>
    Layout = 0,

    /// <summary>A screen template that fills a slot.</summary>
    ScreenTemplate = 1,

    /// <summary>A dialog template.</summary>
    DialogTemplate = 2,
}
