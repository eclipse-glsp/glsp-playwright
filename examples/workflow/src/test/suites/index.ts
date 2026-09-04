/********************************************************************************
 * Copyright (c) 2026 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { WorkflowTest } from '../workflow-test';
import { defineContextMenuSuite, ContextMenuSuiteCustomization } from './context-menu.suite';
import { ConnectableElementSuiteCustomization, defineConnectableElementSuite } from './core/connectable-element.suite';
import { DebugStandaloneSuiteCustomization, defineDebugStandaloneSuite } from './core/debug.standalone.suite';
import { defineEdgeSuite, EdgeSuiteCustomization } from './core/edge.suite';
import { defineGraphSuite, GraphSuiteCustomization } from './core/graph.suite';
import { defineParentSuite, ParentSuiteCustomization } from './core/parent.suite';
import { defineShortcutsSuite, ShortcutsSuiteCustomization } from './core/shortcuts.suite';
import { defineResizeHandleSuite, ResizeHandleSuiteCustomization } from './features/change-bounds/resize-handle.suite';
import { CommandPaletteSuiteCustomization, defineCommandPaletteSuite } from './features/command-palette/command-palette.suite';
import { definePopupSuite, PopupSuiteCustomization } from './features/hover/popup.suite';
import { defineLabelEditToolSuite, LabelEditToolSuiteCustomization } from './features/label-edit/label-edit-tool.suite';
import { defineRoutingPointSuite, RoutingPointSuiteCustomization } from './features/routing/routing-point.suite';
import {
    defineSelectKeybindingStandaloneSuite,
    SelectKeybindingStandaloneSuiteCustomization
} from './features/select/select-keybinding.standalone.suite';
import { defineSelectSuite, SelectSuiteCustomization } from './features/select/select.suite';
import { defineToolPaletteSuite, ToolPaletteSuiteCustomization } from './features/tool-palette/tool-palette.suite';
import { defineDeletionToolSuite, DeletionToolSuiteCustomization } from './features/tools/deletion/deletion-tool.suite';
import { defineEdgeCreationToolSuite, EdgeCreationToolSuiteCustomization } from './features/tools/edge-creation/edge-creation-tool.suite';
import { defineEdgeEditToolSuite, EdgeEditToolSuiteCustomization } from './features/tools/edge-edit/edge-edit-tool.suite';
import { defineNodeCreationToolSuite, NodeCreationToolSuiteCustomization } from './features/tools/node-creation/node-creation-tool.suite';
import { defineUndoRedoSuite, UndoRedoSuiteCustomization } from './features/undo-redo/undo-redo.suite';
import { defineMarkerNavigatorSuite, MarkerNavigatorSuiteCustomization } from './features/validation/marker-navigator.suite';
import { defineMarkerSuite, MarkerSuiteCustomization } from './features/validation/marker.suite';

export * from './context-menu.suite';
export * from './core/connectable-element.suite';
export * from './core/debug.standalone.suite';
export * from './core/edge.suite';
export * from './core/graph.suite';
export * from './core/parent.suite';
export * from './core/shortcuts.suite';
export * from './features/change-bounds/resize-handle.suite';
export * from './features/command-palette/command-palette.suite';
export * from './features/hover/popup.suite';
export * from './features/label-edit/label-edit-tool.suite';
export * from './features/routing/routing-point.suite';
export * from './features/select/select-keybinding.standalone.suite';
export * from './features/select/select.suite';
export * from './features/tool-palette/tool-palette.suite';
export * from './features/tools/deletion/deletion-tool.suite';
export * from './features/tools/edge-creation/edge-creation-tool.suite';
export * from './features/tools/edge-edit/edge-edit-tool.suite';
export * from './features/tools/node-creation/node-creation-tool.suite';
export * from './features/undo-redo/undo-redo.suite';
export * from './features/validation/marker-navigator.suite';
export * from './features/validation/marker.suite';

/** Customizations and explicit skips for all integration-independent Workflow suites. */
export interface WorkflowSuiteCustomizations {
    commandPalette?: CommandPaletteSuiteCustomization;
    connectableElement?: ConnectableElementSuiteCustomization;
    contextMenu?: ContextMenuSuiteCustomization;
    deletionTool?: DeletionToolSuiteCustomization;
    edge?: EdgeSuiteCustomization;
    edgeCreationTool?: EdgeCreationToolSuiteCustomization;
    edgeEditTool?: EdgeEditToolSuiteCustomization;
    graph?: GraphSuiteCustomization;
    labelEditTool?: LabelEditToolSuiteCustomization;
    marker?: MarkerSuiteCustomization;
    markerNavigator?: MarkerNavigatorSuiteCustomization;
    nodeCreationTool?: NodeCreationToolSuiteCustomization;
    parent?: ParentSuiteCustomization;
    popup?: PopupSuiteCustomization;
    resizeHandle?: ResizeHandleSuiteCustomization;
    routingPoint?: RoutingPointSuiteCustomization;
    select?: SelectSuiteCustomization;
    shortcuts?: ShortcutsSuiteCustomization;
    toolPalette?: ToolPaletteSuiteCustomization;
    undoRedo?: UndoRedoSuiteCustomization;
}

/** Customizations for suites that only apply to the standalone Workflow application. */
export interface StandaloneWorkflowSuiteCustomizations extends WorkflowSuiteCustomizations {
    debug?: DebugStandaloneSuiteCustomization;
    selectKeybinding?: SelectKeybindingStandaloneSuiteCustomization;
}

/**
 * Registers the complete Workflow contract shared by standalone, Theia and VS Code integrations.
 *
 * @param test test instance configured for the target integration
 * @param customizations per-suite replacements, extensions, additional cases and explicit skips
 */
export function defineWorkflowSuites(test: WorkflowTest, customizations: WorkflowSuiteCustomizations = {}): void {
    defineConnectableElementSuite(test, customizations.connectableElement);
    defineEdgeSuite(test, customizations.edge);
    defineGraphSuite(test, customizations.graph);
    defineParentSuite(test, customizations.parent);
    defineShortcutsSuite(test, customizations.shortcuts);
    defineContextMenuSuite(test, customizations.contextMenu);
    defineResizeHandleSuite(test, customizations.resizeHandle);
    defineCommandPaletteSuite(test, customizations.commandPalette);
    definePopupSuite(test, customizations.popup);
    defineLabelEditToolSuite(test, customizations.labelEditTool);
    defineRoutingPointSuite(test, customizations.routingPoint);
    defineSelectSuite(test, customizations.select);
    defineToolPaletteSuite(test, customizations.toolPalette);
    defineDeletionToolSuite(test, customizations.deletionTool);
    defineEdgeCreationToolSuite(test, customizations.edgeCreationTool);
    defineEdgeEditToolSuite(test, customizations.edgeEditTool);
    defineNodeCreationToolSuite(test, customizations.nodeCreationTool);
    defineUndoRedoSuite(test, customizations.undoRedo);
    defineMarkerNavigatorSuite(test, customizations.markerNavigator);
    defineMarkerSuite(test, customizations.marker);
}

/**
 * Registers the full standalone contract, including suites that do not apply to editor integrations.
 *
 * @param test test instance configured for a standalone Workflow application
 * @param customizations per-suite replacements, extensions, additional cases and explicit skips
 */
export function defineStandaloneWorkflowSuites(test: WorkflowTest, customizations: StandaloneWorkflowSuiteCustomizations = {}): void {
    defineWorkflowSuites(test, customizations);
    defineDebugStandaloneSuite(test, customizations.debug);
    defineSelectKeybindingStandaloneSuite(test, customizations.selectKeybinding);
}
