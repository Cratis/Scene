# Scene

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

Scene owns the *object model and runtime* half of the Screenplay stack. `Scene.Model` is the platform-agnostic
C# object model that Stage translates Screenplay's parsed language constructs into, and that Studio's
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
