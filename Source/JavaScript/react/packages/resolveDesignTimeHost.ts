// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType } from 'react';
import { ComponentDescriptor, PropertyDescriptor } from '@cratis/scene.model';
import { DesignTimeAction, DesignTimeActionContext } from './DesignTimeAction';
import { DesignTimeActionOutcome } from './DesignTimeActionOutcome';
import { DesignTimeActionState } from './DesignTimeActionState';
import { DesignTimeComponentProps } from './DesignTimeComponentProps';
import { DesignTimeExtensionPoint, designTimeExtensionPointLabels } from './DesignTimeExtensionPoint';
import { DesignTimePropertyDisplayProps } from './DesignTimePropertyDisplayProps';
import { DesignTimePropertyEditorProps } from './DesignTimePropertyEditorProps';
import { DesignTimeResolution } from './DesignTimeResolution';
import { LoadedDesignTimeContributions, loadDesignTimeContributions } from './loadDesignTimeContributions';
import { PackageHostConfiguration, ResolvedPackageHost, resolvePackageHost } from './PackageHostConfiguration';
import { runDesignTimeAction } from './runDesignTimeAction';

/**
 * The generic design-time host contract: every package - first or third party - is reached through these
 * lookups, so a designer never switches on package or component names.
 */
export interface DesignTimeHost {
    /** The runtime package host the design-time contributions were loaded alongside. */
    host: ResolvedPackageHost;

    /** Package-level problems: the host's own, contract version mismatches and declared/provided disagreements. */
    diagnostics: string[];

    preview(descriptor: ComponentDescriptor): DesignTimeResolution<ComponentType<DesignTimeComponentProps>>;
    designer(descriptor: ComponentDescriptor): DesignTimeResolution<ComponentType<DesignTimeComponentProps>>;
    propertyEditor(descriptor: ComponentDescriptor, property: PropertyDescriptor): DesignTimeResolution<ComponentType<DesignTimePropertyEditorProps>>;
    propertyDisplay(descriptor: ComponentDescriptor): DesignTimeResolution<ComponentType<DesignTimePropertyDisplayProps>>;

    /** The component's actions, with the visibility and enablement their owning package decides. */
    actions(descriptor: ComponentDescriptor, context: DesignTimeActionContext): DesignTimeActionState[];

    /** Runs an action and submits its canonical edit batch to the host through `context.submitAction`. */
    runAction(descriptor: ComponentDescriptor, actionId: string, context: DesignTimeActionContext): DesignTimeActionOutcome;

    /** Every unknown or unavailable extension the approved packages' descriptors ask for. */
    diagnoseDescriptors(): string[];
}

/** Options for {@link resolveDesignTimeHost}. */
export interface DesignTimeHostOptions {
    /** Property editor kinds the host implements itself, such as an icon picker or a query binder. */
    hostEditorKinds?: string[];
}

/**
 * Resolves a package host and the design-time contributions of its approved packages. Design-time code is
 * only loaded when the host policy sets `loadDesignTime`; a runtime host gets generic fallbacks everywhere.
 */
export function resolveDesignTimeHost(configuration: PackageHostConfiguration, options: DesignTimeHostOptions = {}): DesignTimeHost {
    const host = resolvePackageHost(configuration);
    const loaded = loadDesignTimeContributions(host.bundles, configuration.policy.loadDesignTime === true);
    const hostEditorKinds = new Set(options.hostEditorKinds ?? []);
    const approved = new Set(host.bundles.map(bundle => bundle.manifest.name));

    const lookup = <T>(descriptor: ComponentDescriptor, point: DesignTimeExtensionPoint, kind: string | undefined): DesignTimeResolution<T> => {
        if (!kind) return {};
        const label = designTimeExtensionPointLabels[point];
        const separator = kind.indexOf(':');
        const owner = separator > 0 ? kind.substring(0, separator) : ownerOf(descriptor);
        const name = separator > 0 ? kind.substring(separator + 1) : kind;
        const outcome = point === DesignTimeExtensionPoint.Action ? 'the host shows it disabled' : `the host uses its generic ${label}`;
        const fallback = (reason: string) => ({ diagnostic: `'${descriptor.component}' asks for the ${label} '${kind}', ${reason}; ${outcome}` });

        if (!approved.has(owner)) return fallback(`but package '${owner}' is not approved by this host`);
        const contributions: LoadedDesignTimeContributions | undefined = loaded.packages.get(owner);
        if (contributions?.unavailableReason) return fallback(`but design-time contributions from package '${owner}' are not loaded`);
        const contribution = contributions?.contributions[point]?.[name] as T | undefined;
        if (contribution !== undefined) return { contribution, package: owner };
        if (point === DesignTimeExtensionPoint.PropertyEditor && separator < 0 && hostEditorKinds.has(kind)) return { hostKind: kind };
        return fallback(`which package '${owner}' does not provide`);
    };

    const actionOf = (descriptor: ComponentDescriptor, actionId: string): DesignTimeAction | undefined =>
        loaded.packages.get(ownerOf(descriptor))?.contributions[DesignTimeExtensionPoint.Action]?.[actionId] as DesignTimeAction | undefined;

    const actions = (descriptor: ComponentDescriptor, context: DesignTimeActionContext): DesignTimeActionState[] =>
        (descriptor.actions ?? []).map(action => {
            const state = { descriptor: action, package: ownerOf(descriptor) };
            const handler = actionOf(descriptor, action.id);
            if (!handler) {
                const resolution = lookup<DesignTimeAction>(descriptor, DesignTimeExtensionPoint.Action, action.id);
                return { ...state, visible: true, enabled: false, diagnostic: resolution.diagnostic };
            }

            try {
                return { ...state, visible: handler.isVisible(context), enabled: handler.isEnabled(context) };
            } catch (error) {
                return { ...state, visible: true, enabled: false, diagnostic: `Action '${action.id}' could not decide its availability: ${String(error)}` };
            }
        });

    const descriptors = host.bundles.flatMap(bundle => bundle.descriptors ?? []);

    return {
        host,
        diagnostics: [...host.diagnostics, ...loaded.diagnostics],
        preview: descriptor => lookup(descriptor, DesignTimeExtensionPoint.Preview, descriptor.previewKind),
        designer: descriptor => lookup(descriptor, DesignTimeExtensionPoint.Designer, descriptor.editorKind),
        propertyEditor: (descriptor, property) => lookup(descriptor, DesignTimeExtensionPoint.PropertyEditor, property.editorKind),
        propertyDisplay: descriptor => lookup(descriptor, DesignTimeExtensionPoint.PropertyDisplay, descriptor.propertyDisplayKind),
        actions,
        runAction: (descriptor, actionId, context) => {
            const state = actions(descriptor, context).find(action => action.descriptor.id === actionId);
            const handler = actionOf(descriptor, actionId);
            if (!state || !handler || !state.visible || !state.enabled) {
                const reason = state?.diagnostic ?? (state ? `Action '${actionId}' is not available here` : `'${descriptor.component}' has no action '${actionId}'`);
                return { submitted: false, edits: [], diagnostics: [reason] };
            }

            return runDesignTimeAction(handler, context);
        },
        diagnoseDescriptors: () =>
            descriptors.flatMap(descriptor => [
                lookup(descriptor, DesignTimeExtensionPoint.Preview, descriptor.previewKind),
                lookup(descriptor, DesignTimeExtensionPoint.Designer, descriptor.editorKind),
                lookup(descriptor, DesignTimeExtensionPoint.PropertyDisplay, descriptor.propertyDisplayKind),
                ...descriptor.properties.map(property => lookup(descriptor, DesignTimeExtensionPoint.PropertyEditor, property.editorKind)),
                ...(descriptor.actions ?? []).map(action => lookup(descriptor, DesignTimeExtensionPoint.Action, action.id)),
            ])
                .map(resolution => resolution.diagnostic)
                .filter((diagnostic): diagnostic is string => diagnostic !== undefined),
    };
}

function ownerOf(descriptor: ComponentDescriptor): string {
    const separator = descriptor.component.indexOf(':');
    return separator > 0 ? descriptor.component.substring(0, separator) : descriptor.component;
}
