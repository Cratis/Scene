// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// Any edit the engine applies, discriminated by <c language="json">kind</c>. Each is a plain, serializable record, so a host
/// can persist it, replay it and build undo and redo on top.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "kind")]
[JsonDerivedType(typeof(SetPropertyEdit), "setProperty")]
[JsonDerivedType(typeof(ResetPropertyEdit), "resetProperty")]
[JsonDerivedType(typeof(ChangeLayoutTypeEdit), "changeLayoutType")]
[JsonDerivedType(typeof(InsertNodeEdit), "insertNode")]
[JsonDerivedType(typeof(MoveNodeEdit), "moveNode")]
[JsonDerivedType(typeof(RemoveNodeEdit), "removeNode")]
[JsonDerivedType(typeof(SetInstanceValueEdit), "setInstanceValue")]
[JsonDerivedType(typeof(ResetInstanceValueEdit), "resetInstanceValue")]
[JsonDerivedType(typeof(AddCollectionItemEdit), "addCollectionItem")]
[JsonDerivedType(typeof(RemoveCollectionItemEdit), "removeCollectionItem")]
[JsonDerivedType(typeof(ReorderCollectionItemEdit), "reorderCollectionItem")]
[JsonDerivedType(typeof(EditCollectionItemEdit), "editCollectionItem")]
[JsonDerivedType(typeof(ExposePropertyEdit), "exposeProperty")]
[JsonDerivedType(typeof(UnexposePropertyEdit), "unexposeProperty")]
public abstract record SceneEdit;
