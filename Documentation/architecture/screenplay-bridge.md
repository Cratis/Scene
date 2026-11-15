---
title: The Screenplay bridge
description: Cratis.Scene.Screenplay is the one two-way bridge between Screenplay and Scene - Screenplay converted into Scene's model, a Scene document printed back as Screenplay, the design system, free screens, and what a round trip promises.
---

A `.play` document is the source of truth and Scene is what renders and edits it, so something has to carry meaning from one to the
other and back. `Cratis.Scene.Screenplay` is that something. It is the only place Screenplay's syntax and Scene's model meet:
Stage, Studio and Direct consume it, and none of them holds a converter of its own.

```text
Screenplay syntax ──── Forward ───▶ Scene model         (Cratis.Scene.Screenplay.Forward)
        ▲                               │
        │                               ▼
        └──────── Reverse ───── Scene document (JSON)    (Cratis.Scene.Screenplay.Reverse)
```

Screenplay knows nothing of Scene. The package depends on `Cratis.Scene.Model`, `Cratis.Scene.Engine` and `Cratis.Screenplay`.

## Forward: Screenplay into Scene

`ScreenplaySceneParser` compiles Screenplay source and converts what the compiler answers into a `SceneApplication`: the UI profiles
and themes, layouts, screen and dialog templates, screens (slice screens and free screens), forms, behaviors, exposures and
instance contributions, navigation and outlet levels, sample data, and the structure navigation resolves against.

```csharp
var result = new ScreenplaySceneParser().Parse(source);
SceneApplication application = result.Value!;
```

A host that has already compiled the application visits it directly - `new ScreenplaySceneVisitor().Visit(syntax)` - and one
that wants the findings Scene's own validation would raise on the converted structure asks for them:

```csharp
IEnumerable<ConversionFinding> findings = ApplicationFindings.ForApplication(application);
```

A conversion reports rather than throws. What Scene cannot say arrives as `SceneApplication.ConversionDiagnostics`, and what a
runtime cannot execute as `SceneApplication.RuntimeIssues`. A host decides what a diagnostic means for it.

### What stays in the host

The conversion is pure. What is not pure stays with the host that has the context for it:

| Concern | Where it lives |
| --- | --- |
| Planning a render for a target (selecting the shell per platform, runtime admission of what a target can run) | Stage |
| Arc routes, command schemas and response contracts | Stage |
| The packages a Stage ships and its outlet chains | Stage |
| Roles, slices and the board a screen belongs to | The host that owns the event model (Studio) |

The package takes the pieces a host needs as parameters. Where Studio used an actor identity, the bridge takes a plain string.

## Reverse: Scene into Screenplay

A Scene document - the JSON an editor holds - is printed as Screenplay and read back by `SceneDocumentApplication`. A host that
has a board assembles the application itself from the pieces of the bridge (`SceneDocumentScreenplayBridge`, `SceneModuleExports`,
`SceneDocumentScreenplayText`); a host that holds only documents uses the two functions that do it all:

```csharp
SceneDocumentApplicationPrint print = SceneDocumentApplication.Print(documents);
// print.Source     the Screenplay
// print.Warnings   what the documents hold that Screenplay cannot say
IReadOnlyList<ImportedScreenDocument> read = SceneDocumentApplication.Read(application);
```

### The pieces, public

A host with a board (Studio's export and import) assembles the application from the same pieces the two functions above use, so they are
public in `Cratis.Scene.Screenplay.Reverse` and take plain `string` and `Guid` identities:

| Piece | What a host uses it for |
| --- | --- |
| `SceneDocumentScreenplayBridge`, `SceneModuleExports`, `SceneDocumentScreenplayText` | Export a role's document (or a module's, or the application's) as typed screens and forms, and read screens back as documents |
| `SceneDeclarationSet`, `SceneDocumentScreenplayDeclarations` | What the documents declare beside their screens, merged once for the application: layouts, templates, exposures, instance contributions, ui profiles, themes - and `Navigation`, `FeatureOutlets` and `Native`, which the host puts on the application's layout, its modules and its features |
| `SceneNavigation`, `SceneOutletLevels` (`ApplyTo`) | Read the `navigation` and `outletLevels` members, and put the regions and the outlet refinements on the layout, the modules and the features |
| `SceneNative` | What a document keeps natively because Scene has no element for it (`Of`, `Uses`, `Queries`, `ResidueOf`, `FeatureAt` on the residue) |
| `SceneTemplates`, `SceneElementImport`, `SceneElementFrame`, `SceneJson`, `SceneTransportGaps` | Read and write layouts and templates, turn typed directives back into Scene elements, read a document's JSON tolerantly and collect what could not travel |
| `SceneDocumentCarrier` | Recognize the preservation carrier (`IsCarrier`) so the host can leave it out of what it shows |
| `SceneCommandReferences` | `CommandNames` lists the command of each State Change slice by the slice's id; `Resolve` makes a document name commands instead of slice ids before it is exported |
| `SceneDocumentCanonicalForm` | Compare two documents by meaning (`FirstDifference`); `DefaultLayoutDeclaration()` is the layout every screen the editor draws is drawn in |
| `SceneDocumentUpgrade` | Bring a document stored before Scene 5 to the slot shape when it is read |

No public type is nested in a type that is not public: type discovery in a host lists nested types by their declaring type, and a public
type inside an internal one stops the host's build. A specification in the package checks it.

### Screenplay text and a Scene document

A host that shows or edits a screen as Screenplay text on its own server - the canvas's `screenplay` seam - does not re-implement that.
`ScreenplayBridge` in `Cratis.Scene.Design.AI.Workbench` (package `Cratis.Scene.Design.AI`) is the bridge a design turn runs through:

```csharp
var bridge = new ScreenplayBridge(applicationScreenplay);

// text -> document: the texts are compiled together with the application, so what they name is checked where it is declared
BridgeDocument compiled = bridge.ToDocument([screenText], DesignMode.Screens);   // DesignMode.Templates for screen templates
if (compiled.Succeeded) { SceneDocument document = compiled.Document!; }
// compiled.Diagnostics: errors and warnings by the screen that wrote them

// document -> text: null when what the document holds cannot be said as Screenplay
string? text = bridge.ToText(document, "InvoiceList", DesignMode.Screens, shapesDeclaredElsewhere: new HashSet<string>());

IReadOnlyList<string> names = ScreenplayBridge.Declared(text, DesignMode.Screens);
IReadOnlySet<string> shapes = ScreenplayBridge.DeclaredShapes(text);
```

It lives in the Design.AI package because it speaks in design sessions and modes (`DesignMode`, `DesignDiagnostic`), which `Cratis.Scene.Screenplay`
does not know; a host that already references Design.AI gets it without a copy.

Every role's screens become the screens of one slice, and what the documents declare beside their screens - layouts, templates,
profiles, themes, design systems, behaviors, sample data, exposures, navigation and outlet refinements - is declared once for the
application, the way Screenplay declares them.

A document holding something typed Screenplay cannot say travels on a **preservation carrier** instead: the typed part still reaches
the stage, and the exact document rides beside it. Nothing is dropped, and a warning names each member that could not travel typed.

## The design system

`DesignSystemConverter` turns the design system an application declares, and what Screenplay's `DesignSystemResolver` resolves it
to, into Scene's resolved design system model:

```csharp
DesignSystem? designSystem = DesignSystemConverter.Convert(application, mappings);
```

Each theme that implements the design system carries, per mode, every token's value and every component part resolved to a
value, with the problems the resolver found - so the Scene engines, Stage and generated React cannot disagree with Screenplay about what a
primary button looks like in dark mode. The contrast rules are carried and measured against every theme, mode, variant and state.

A design-system component finds the Scene component that renders it by name through the profile's packages. When a name is not
enough, a `ComponentMapping` says which component, which property carries the variant, and how a variant's name maps to the value
that property takes:

```csharp
DesignLinking links = DesignSystemConverter.Link(designSystem, profile, catalog, components);
```

Scene's own linker runs over the converted design system, so a component whose anatomy a package component cannot show is
reported by the same diagnostics wherever the design system is read.

## Free screens

A free screen is declared first and adopted by a slice later (`shape`, `screen`, `uses screen` and the provisions that supply each need). In Scene it is one screen:

- its need becomes a `core:data` element, carrying the shape contract (`shape`) the top-level `shape` declares;
- an adopting slice's provision becomes the element's data binding - `query`, `by` and a `fieldMap` for every
  `<field> from <path>` where the names differ;
- a screen several slices adopt is owned by the first, and lists every adoption in `provisions`, so a host that scopes a preview to
  a slice finds its own binding and nothing is lost;
- a need nobody provides stays a need. Screenplay reports it; Scene shows it as a design-time screen.

Reverse conversion prints them back: a document's free screens are declared where their `path` says, with the shapes they need,
and each adopting slice is declared with the read model and query that provide what it provides - the read model holds the fields of the
shape, under the path a mapping reads when the names differ - so what adopts the screen compiles.

## What a round trip promises

The promise is Screenplay's decision 0013: two models are equivalent when their **declarative constructs** have the same canonical
meaning, and what a realization cannot recover is **reported as an explicit loss**, never passed silently.

| Direction | What is proved |
| --- | --- |
| Screenplay → Scene → Screenplay | The design system, its theme, layouts, UI profiles, free screens, their shapes and what each adopting slice provides come back as printed-identical constructs. The screen of a role comes back as the same screen. |
| Scene → Screenplay → Scene | A document edited by the engine - every document of the shared edit corpus, after every case's edits - comes back as the document the engine produced. A typed document comes back rebuilt from the Screenplay, not handed back verbatim. |

A round trip does not preserve where a screen sits on a board. The documents hold screens by role, so Screenplay → Scene → Screenplay
puts them in the one slice of the application; the slices of the original board (and their queries and read models) belong to the host that has the board.

## Packaging

| | |
| --- | --- |
| Package | `Cratis.Scene.Screenplay` |
| Depends on | `Cratis.Scene.Model`, `Cratis.Scene.Engine`, `Cratis.Screenplay` |
| Text bridge for hosts | `ScreenplayBridge` in `Cratis.Scene.Design.AI` |
| Consumed by | Stage, Studio, Direct, and `Cratis.Scene.Design` where it reads or writes Screenplay |

## See also

- [Layering and seams](layering.md) - where the convert step sits.
- [Component anatomy](../component-anatomy.md) - what a design-system component says about a package component.
