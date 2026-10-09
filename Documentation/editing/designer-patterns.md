---
title: Designer patterns from WinForms and ASP.NET
description: Which design-time patterns Scene adopts from the WinForms and ASP.NET Web Forms designers, how each maps to a Scene extension point, and what Scene deliberately leaves out.
---

Scene lets a package bring its own previews, designers, property editors, property displays and design-time actions. The .NET designers solved the same problem twice, for WinForms and for ASP.NET Web Forms. This page records what Scene adopts from them, and what it leaves behind. It adapts concepts. It does not host .NET designers.

## What the .NET designers separate

Both designers keep three things apart:

- **The component** is what runs. A WinForms `Control` or an ASP.NET `WebControl` knows nothing about the designer.
- **The designer** is a separate type, such as `ComponentDesigner` or `ControlDesigner`, attached through `DesignerAttribute`. The attribute can name the designer by type name, so the runtime assembly does not have to load designer code. The .NET WinForms designer goes further: it runs designers out of process, built against a separate designer SDK.
- **The document** is changed only through the design surface's services. `IComponentChangeService` announces each change, `DesignerTransaction` groups changes into one undoable unit, and `UndoEngine` turns them into undo and redo. Serializers such as `CodeDomSerializer` (WinForms) or the control persister (Web Forms markup) write the result.

Property editing runs through data, not through the component. `TypeDescriptor` returns `PropertyDescriptor`s for a component, and `ICustomTypeDescriptor` or a `TypeDescriptionProvider` can add, hide or change them. The `PropertyGrid` renders whatever the descriptors say. A property can name a `UITypeEditor` through `EditorAttribute` for a dropdown or modal editor. `UITypeEditor.PaintValue` draws a small preview of the value. `TypeConverter` turns a value into display text.

Commands come in two forms. `ComponentDesigner.Verbs` returns `DesignerVerb`s for context menus. `DesignerActionList` returns the smart-tag panel. Its `GetSortedActionItems` decides which items appear for the current state of the component, so the owning designer, not the host, controls what is offered. Web Forms data-bound control designers use the same panel for tasks such as choosing a data source and refreshing the schema, which regenerates the columns.

ASP.NET's `ControlDesigner.GetDesignTimeHtml` produces a design-time preview. `GetEmptyDesignTimeHtml` and `GetErrorDesignTimeHtml` are its fallbacks for a control with nothing to show and for a designer that failed. A broken designer degrades to a placeholder rather than taking the design surface down.

## How Scene maps them

| .NET designer concept | Scene equivalent | Where it lives |
| --- | --- | --- |
| `PropertyDescriptor`, `TypeDescriptor`, `ICustomTypeDescriptor` | `ComponentDescriptor` and `PropertyDescriptor`, shipped as data in a bundle's `descriptors` | `Scene.Model` |
| `DesignerAttribute` naming a designer type | `ScenePackage.designTime`, which names every contribution and declares a `contractVersion` | `Scene.Model` |
| `ComponentDesigner` / `ControlDesigner` | `DesignTimeBundle.designers`, chosen by `ComponentDescriptor.editorKind` | Optional design-time bundle |
| `GetDesignTimeHtml` with empty and error fallbacks | `DesignTimeBundle.previews`, chosen by `previewKind`; the host's generic preview is the fallback | Optional design-time bundle |
| `UITypeEditor` through `EditorAttribute` | `DesignTimeBundle.propertyEditors`, chosen by `PropertyDescriptor.editorKind`; host editor kinds and the value-type editor are the fallbacks | Optional design-time bundle |
| `UITypeEditor.PaintValue`, `TypeConverter` display text | `DesignTimeBundle.propertyDisplays`, chosen by `propertyDisplayKind` | Optional design-time bundle |
| `DesignerVerb`, `DesignerActionList` | `DesignTimeActionDescriptor` (data) and `DesignTimeAction` with `isVisible` and `isEnabled` decided by the owning package | Descriptor in `Scene.Model`, handler in the bundle |
| Refreshing a data-bound control's schema | A Generate fields action that turns command metadata into items | Package action |
| `IComponentChangeService`, `DesignerTransaction`, `UndoEngine` | Canonical `SceneEdit` batches submitted through `submitEdits` and `submitAction`; the host's validation and history apply them | Host |
| `IDesignerHost` services | A typed `DesignTimeContext`: the element, its descriptor, effective configuration, profile, permissions, capabilities and diagnostics | `@cratis/scene.react` |

`resolveDesignTimeHost` is the generic host. It reaches every package through the same lookups, so a designer never switches on a package or component name. [Package design-time extensions](./design-time-extensions.md) describes it.

## What Scene leaves out

- **No service container.** A .NET designer pulls services such as `ISelectionService` from `IDesignerHost` at runtime, so its real dependencies are invisible until it runs. A Scene contribution receives one typed context, and that context is the whole contract.
- **No package serializers.** Code and markup serializers write the source of a form or page. A Scene document is already the serialized form. A package changes it only through canonical edits, never by writing files.
- **No attributes on runtime types.** .NET attaches design-time behavior to the component class. Scene keeps descriptors and design-time names as package data, so Stage, Studio and a C# host read them without loading any component.
- **No in-process trust by default.** Hosting a designer used to mean loading its code next to the designer. A Scene host loads design-time code only when its policy sets `loadDesignTime`, approves executable imports, and the package's contract version matches. Otherwise each lookup falls back and says why.

## Versioning

A .NET designer is versioned with the framework it targets, which is what made the move to an out-of-process designer a breaking change for designer authors. Scene versions the contract explicitly instead. `PackageDesignTimeMetadata.contractVersion` states the `major.minor` contract a bundle was written against. A host loads the bundle only when the major version matches its own `DesignTimeContractVersion`. A minor version only adds optional members.

## Sources

- [Designer overview (Windows Forms)](https://learn.microsoft.com/en-us/dotnet/desktop/winforms/controls-design/designer-overview)
- [DesignerActionList](https://learn.microsoft.com/en-us/dotnet/api/system.componentmodel.design.designeractionlist)
- [ComponentDesigner.Verbs](https://learn.microsoft.com/en-us/dotnet/api/system.componentmodel.design.componentdesigner.verbs)
- [UITypeEditor](https://learn.microsoft.com/en-us/dotnet/api/system.drawing.design.uitypeeditor)
- [ControlDesigner.GetDesignTimeHtml (ASP.NET)](https://learn.microsoft.com/en-us/dotnet/api/system.web.ui.design.controldesigner.getdesigntimehtml)
