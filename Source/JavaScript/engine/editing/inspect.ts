// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DiagnosticCode, DiagnosticSeverity, EditTarget, InspectedCollectionItem, InspectedProperty, NodeInspection,
    NodeProvenance, ProvenanceKind, PropertyDescriptor, PropertyValueType, SceneDiagnostic, SceneDocument, SceneNodeKind, ValueSource,
} from '@cratis/scene.model';
import { describeNode, readNodeValue } from './describeNode';
import { EffectiveIconCatalog } from '../icons/EffectiveIconCatalog';
import { EditingContext } from './EditingContext';
import { computeExposureGrants, ExposureGrant, grantKey } from './exposureGrants';
import { iconProblemsOfItems, iconProblemsOfProperty } from './iconDiagnostics';
import { indexDocument } from './indexDocument';
import { NodeRecord } from './DocumentIndex';
import { resolveEffectiveConfiguration } from './resolveEffectiveConfiguration';
import { resolveTemplateChain } from './resolveTemplateChain';
import { TemplateChain } from './TemplateChain';

/**
 * Works out whether a node is the editing scope's own, and when it is not, where it comes from and whether any of
 * it is configurable here.
 *
 * @param record The node.
 * @param chain The chain the scope sits in.
 * @param scopeGrants What the scope's own instance may configure.
 */
export function provenanceOf(record: NodeRecord, chain: TemplateChain, scopeGrants: Map<string, ExposureGrant> | undefined): NodeProvenance {
    const scopeLevel = chain.levels.at(-1);
    if (scopeLevel && record.owner === scopeLevel.owner && record.ownerKind === scopeLevel.kind) return { kind: ProvenanceKind.Local };

    const configurable = record.kind === SceneNodeKind.Element
        && [...(scopeGrants?.values() ?? [])].some(grant => grant.component === (record.value as { id: string }).id);
    return { kind: configurable ? ProvenanceKind.ConfigurableInherited : ProvenanceKind.Inherited, source: record.owner };
}

function isRemovable(record: NodeRecord, provenance: NodeProvenance): boolean {
    return provenance.kind === ProvenanceKind.Local
        && (record.list !== undefined || record.leafId !== undefined || record.placementIds !== undefined);
}

function toInspectedItems(raw: unknown, local: boolean): InspectedCollectionItem[] {
    return (Array.isArray(raw) ? raw : []).map((item: Record<string, unknown>, position) => {
        const { id, ...values } = item;
        return { id: typeof id === 'string' ? id : `owner-${position}`, values, origin: 'owner', editable: local };
    });
}

/**
 * The value a property takes when nothing configures it. A stored `null` is a real value for a `json` property
 * (it is valid JSON, and clearing it to the default would hide it), so only that type keeps it; every other
 * type falls back to its default for `null` and `undefined` alike.
 */
function effectiveValueOf(descriptor: PropertyDescriptor, currentValue: unknown): unknown {
    if (currentValue === null && descriptor.valueType === PropertyValueType.Json) return null;
    return currentValue ?? descriptor.default;
}

function inspectProperty(
    descriptor: PropertyDescriptor,
    record: NodeRecord,
    provenance: NodeProvenance,
    scopeInstance: string | undefined,
    grants: Map<string, ExposureGrant> | undefined,
    configuredValues: { path: string; value: unknown; source: string; items?: { id: string; values: Record<string, unknown>; origin: string }[] }[] | undefined,
): InspectedProperty {
    const currentValue = readNodeValue(record, descriptor.path);
    const configured = configuredValues?.find(candidate => candidate.path === descriptor.path);
    const local = provenance.kind === ProvenanceKind.Local;
    const isCollection = descriptor.valueType === PropertyValueType.Collection;

    const inspected: InspectedProperty = {
        descriptor,
        currentValue,
        effectiveValue: configured ? configured.value : effectiveValueOf(descriptor, currentValue),
        source: (configured?.source ?? (currentValue === undefined ? ValueSource.Default : ValueSource.Local)) as ValueSource,
        editable: false,
    };

    const grant = !local && record.kind === SceneNodeKind.Element
        ? grants?.get(grantKey((record.value as { id: string }).id, descriptor.path))
        : undefined;

    if (local) {
        inspected.editable = descriptor.readOnly !== true;
        if (inspected.editable) inspected.editTarget = EditTarget.Node;
        else inspected.reason = 'This property is read-only.';
    } else if (grant) {
        inspected.editable = true;
        inspected.editTarget = EditTarget.Instance;
        if (isCollection) inspected.operations = grant.operations;
    } else {
        inspected.reason = `Inherited from '${provenance.source}', which does not expose it.`;
    }

    if (isCollection) {
        const items = configured?.items
            ? configured.items.map(item => ({ ...item, editable: local || (item.origin === scopeInstance && grant !== undefined && grant.operations.length > 0) }))
            : toInspectedItems(currentValue, local);
        inspected.items = items;
    }

    return inspected;
}

/**
 * Reports icons the profile cannot supply - on the node itself and in configuration contributed to it. The values
 * stay where they are; these are warnings.
 */
function iconDiagnosticsOf(properties: InspectedProperty[], iconCatalog: EffectiveIconCatalog, nodeId: string): SceneDiagnostic[] {
    return properties.flatMap(property => {
        const descriptor = property.descriptor;
        if (descriptor.valueType !== PropertyValueType.Collection) {
            return iconProblemsOfProperty(iconCatalog, descriptor, property.effectiveValue, DiagnosticSeverity.Warning, { nodeId });
        }

        const items = (property.items ?? []).map(item => ({ id: item.id, values: item.values, instance: item.origin === 'owner' ? undefined : item.origin }));
        return iconProblemsOfItems(iconCatalog, descriptor.item, items, DiagnosticSeverity.Warning, { nodeId, path: descriptor.path });
    });
}

/**
 * Describes one node for an editor: what it is, where it comes from, what can be edited on it - with current and
 * effective values and effective editability - and what can be done with it.
 *
 * A property of a node the scope owns is edited on the node. A property of an inherited node is editable only
 * when its owner exposed it, and then the edit goes to an instance contribution, never into the inherited node.
 * Nothing is mutated.
 *
 * @param document The document to read.
 * @param nodeId The node to describe; see the node id functions.
 * @param context The catalog and the editing scope.
 * @returns The inspection, or `undefined` when the document has no such node.
 */
export function inspect(document: SceneDocument, nodeId: string, context: EditingContext): NodeInspection | undefined {
    const index = indexDocument(document);
    const record = index.nodes.get(nodeId);
    if (!record) return undefined;

    const chain = resolveTemplateChain(document, context.scope);
    const grants = computeExposureGrants(chain, context.catalog);
    const scopeInstance = chain.levels.at(-1)?.instance;
    const scopeGrants = scopeInstance === undefined ? undefined : grants.byInstance.get(scopeInstance);
    const configuration = resolveEffectiveConfiguration(chain, document.instanceContributions, context.catalog);

    const provenance = provenanceOf(record, chain, scopeGrants);
    const description = describeNode(record, context.catalog);
    const componentId = record.kind === SceneNodeKind.Element ? (record.value as { id: string }).id : undefined;
    const configuredValues = configuration.components.find(candidate => candidate.component === componentId)?.values;

    const diagnostics: SceneDiagnostic[] = [
        ...description.diagnostics,
        ...configuration.diagnostics.filter(diagnostic => diagnostic.component !== undefined && diagnostic.component === componentId),
    ];
    if (chain.levels.length === 0) {
        diagnostics.push(...chain.diagnostics.filter(diagnostic => diagnostic.code === DiagnosticCode.UnknownScope));
    }

    const properties = description.properties.map(descriptor => inspectProperty(descriptor, record, provenance, scopeInstance, scopeGrants, configuredValues));
    if (context.iconCatalog) {
        diagnostics.push(...iconDiagnosticsOf(properties, context.iconCatalog, nodeId));
    }

    return {
        nodeId,
        kind: record.kind,
        typeId: record.typeId,
        label: record.label,
        parentId: record.parentId,
        provenance,
        properties,
        capabilities: description.capabilities,
        removable: isRemovable(record, provenance),
        diagnostics,
    };
}
