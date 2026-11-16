// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Applies edits to a Scene document, with the same outcomes and diagnostics as the TypeScript engine's <c language="text">applyEdit</c>.
/// </summary>
public static class EditApplier
{
    /// <summary>
    /// Applies one edit to a document.
    /// </summary>
    /// <remarks>
    /// Pure and immutable: the document passed in is never changed, and the result is a new document. Edits are plain data, so a host
    /// can persist them and build undo and redo by keeping the documents either side. On any error the prior document comes back - the
    /// same object - together with the diagnostics, so a refused edit leaves nothing half done.
    /// What an edit may touch follows the editing scope. Nodes the scope owns are edited directly; inherited nodes are read-only, and
    /// their exposed properties are configured with the instance edits, which are checked against what each owner exposed.
    /// </remarks>
    /// <param name="model">The document to edit.</param>
    /// <param name="edit">What to do.</param>
    /// <param name="context">The catalog and the editing scope.</param>
    /// <returns>The outcome.</returns>
    public static EditOutcome Apply(SceneDocument model, SceneEdit edit, EditingContext context)
    {
        var root = SceneDocumentData.ToData(model);
        var session = new EditSession(model, root, context);
        var clone = (JsonObject)root.DeepClone();
        var diagnostics = new List<SceneDiagnostic>();

        Run(session, edit, clone, diagnostics);

        if (Finding.HasErrors(diagnostics))
        {
            return new EditOutcome(model, diagnostics, false);
        }

        return new EditOutcome(SceneDocumentData.FromData(clone), diagnostics, true);
    }

    static void Run(EditSession session, SceneEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        switch (edit)
        {
            case SetPropertyEdit set:
                PropertyEdits.ApplySet(session, set, clone, diagnostics);
                break;
            case ResetPropertyEdit reset:
                PropertyEdits.ApplyReset(session, reset, clone, diagnostics);
                break;
            case ChangeLayoutTypeEdit change:
                LayoutTypeEdits.Apply(session, change, clone, diagnostics);
                break;
            case InsertNodeEdit insert:
                StructureEdits.ApplyInsert(session, insert, clone, diagnostics);
                break;
            case MoveNodeEdit move:
                StructureEdits.ApplyMove(session, move, clone, diagnostics);
                break;
            case RemoveNodeEdit remove:
                StructureEdits.ApplyRemove(session, remove, clone, diagnostics);
                break;
            case SetInstanceValueEdit setInstance:
                InstanceEdits.ApplySet(session, setInstance, clone, diagnostics);
                break;
            case ResetInstanceValueEdit resetInstance:
                InstanceEdits.ApplyReset(session, resetInstance, clone, diagnostics);
                break;
            case AddCollectionItemEdit add:
                InstanceEdits.ApplyAdd(session, add, clone, diagnostics);
                break;
            case RemoveCollectionItemEdit removeItem:
                InstanceEdits.ApplyRemove(session, removeItem, clone, diagnostics);
                break;
            case ReorderCollectionItemEdit reorder:
                InstanceEdits.ApplyReorder(session, reorder, clone, diagnostics);
                break;
            case EditCollectionItemEdit editItem:
                InstanceEdits.ApplyEditItem(session, editItem, clone, diagnostics);
                break;
            case ExposePropertyEdit expose:
                ExposureEdits.ApplyExpose(session, expose, clone, diagnostics);
                break;
            case UnexposePropertyEdit unexpose:
                ExposureEdits.ApplyUnexpose(session, unexpose, clone, diagnostics);
                break;
            default:
                diagnostics.Add(Finding.Error(DiagnosticCode.InvalidEdit, $"'{edit.GetType().Name}' is not an edit this engine knows."));
                break;
        }
    }
}
