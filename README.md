# Scene

**Describing a user interface without describing a platform** — Scene is the UI model of the Cratis
model-first layer (experimental).

The object model and runtime for Screenplay-based UIs: `Scene.Model` (platform-agnostic screens, layouts,
forms, contribution points, ui profiles and themes), `Scene.Engine` (binding/resolution runtime), and
`Scene.React` (the React renderer).

## Packages / Deployables

[![Nuget](https://img.shields.io/nuget/v/Cratis.Scene.Model?logo=nuget)](http://nuget.org/packages/Cratis.Scene.Model)
[![NPM](https://img.shields.io/npm/v/@cratis/scene.model?label=@cratis/scene.model&logo=npm)](https://www.npmjs.com/package/@cratis/scene.model)
[![NPM](https://img.shields.io/npm/v/@cratis/scene.engine?label=@cratis/scene.engine&logo=npm)](https://www.npmjs.com/package/@cratis/scene.engine)
[![NPM](https://img.shields.io/npm/v/@cratis/scene.react?label=@cratis/scene.react&logo=npm)](https://www.npmjs.com/package/@cratis/scene.react)

## Builds

[![.NET Build](https://github.com/cratis/scene/actions/workflows/dotnet-build.yml/badge.svg)](https://github.com/cratis/scene/actions/workflows/dotnet-build.yml)
[![JavaScript Build](https://github.com/cratis/scene/actions/workflows/javascript-build.yml/badge.svg)](https://github.com/cratis/scene/actions/workflows/javascript-build.yml)

## Description

Scene owns the *object model and runtime* half of the Screenplay stack. In the model-first pipeline,
[Screenplay](https://github.com/Cratis/Screenplay) describes an event-sourced, CQRS system,
[Stage](https://github.com/Cratis/Stage) renders it into a running application, and Scene is how that
application's user interface is described — independently of any rendering platform.

`Scene.Model` is the platform-agnostic
C# object model that [Stage](https://github.com/Cratis/Stage) translates Screenplay's parsed language constructs into, and that [Studio](https://github.com/Cratis/Studio)'s
design-time tooling reads and writes. `Scene.Engine` walks that graph, resolves bindings (data, action, form,
navigation contribution) and drives whichever renderer is plugged in — it does not know React exists.
`Scene.React` is one renderer implementing the abstract vocabulary against real React/DOM; sibling positions
are reserved for future `Scene.Native` / `Scene.Desktop` renderers. Vendor and internal component packages
(PrimeReact, internal widget libraries) are adapters plugging into the renderer contract, not part of it.

The design-time editor built on top of this object model lives in Studio, not here — see
[StudioIssues#156](https://github.com/Cratis/StudioIssues/issues/156).

## Support

Cratis is an open community, and we are glad to help users, teams evaluating the stack, and contributors.

| Channel | Details |
|---|---|
| Discord | Join the community on [Discord](https://discord.gg/kt4AMpV8WV) for questions and discussions |
| GitHub Issues | [Report bugs or request features](https://github.com/Cratis/Scene/issues) |
| Documentation | Read the docs at [cratis.io](https://cratis.io) |

## The Cratis ecosystem

This project is part of [Cratis](https://www.cratis.io) — free, MIT-licensed tools for building event-sourced and CQRS applications.

- **[Chronicle](https://github.com/Cratis/Chronicle)** — event-sourcing database and runtime. Orleans-based kernel, pluggable storage (MongoDB default; PostgreSQL, SQL Server, SQLite, in-memory), language-agnostic gRPC contracts. [Docs](https://www.cratis.io/chronicle/)
- **Chronicle clients** — first-class [.NET SDK](https://github.com/Cratis/Chronicle), plus [TypeScript](https://github.com/Cratis/Chronicle.TypeScript), [Kotlin/Java](https://github.com/Cratis/Chronicle.Kotlin), and [Elixir](https://github.com/Cratis/Chronicle.Elixir); [Python](https://github.com/Cratis/Chronicle.Python) coming soon (pre-alpha). AI agents connect through the [Chronicle MCP server](https://github.com/Cratis/Chronicle.Mcp).
- **[Arc](https://github.com/Cratis/Arc)** — opinionated CQRS framework for ASP.NET Core with commands, queries, validation, authorization, and TypeScript proxy generation. Works without event sourcing. [Docs](https://www.cratis.io/arc/)
- **[Components](https://github.com/Cratis/Components)** — React components aligned with Arc patterns. [Docs](https://www.cratis.io/components/)
- **[CLI](https://github.com/Cratis/cli) + Workbench** — inspect and diagnose Chronicle from the terminal or the browser. [Docs](https://www.cratis.io/cli/)
- **Model-first layer (experimental)** — [Studio](https://github.com/Cratis/Studio), [Screenplay](https://github.com/Cratis/Screenplay), [Stage](https://github.com/Cratis/Stage), Scene (this repository), [Prologue](https://github.com/Cratis/Prologue)
- **Supporting** — [Fundamentals](https://github.com/Cratis/Fundamentals), [Specifications](https://github.com/Cratis/Specifications), [Synopsis](https://github.com/Cratis/Synopsis), [Lens](https://github.com/Cratis/Lens), [Narrator](https://github.com/Cratis/Narrator), and free [AI tooling](https://github.com/Cratis/AI) (preview); [Ensemble](https://github.com/Cratis/Ensemble) coming soon (pre-release)
- **[Samples](https://github.com/Cratis/Samples)** — runnable event sourcing and CQRS samples for the whole stack

Everything Cratis publishes today is MIT licensed and free to use.

---

Part of the [Cratis](https://www.cratis.io) platform · [MIT](./LICENSE)
