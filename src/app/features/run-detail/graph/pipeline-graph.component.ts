import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GraphEdge, GraphNode, NodeStatus } from '../../../core/models';

@Component({
  selector: 'app-pipeline-graph',
  templateUrl: './pipeline-graph.component.html',
  styleUrls: ['./pipeline-graph.component.css'],
})
export class PipelineGraphComponent {
  @Input() nodes: GraphNode[] = [];
  @Input() edges: GraphEdge[] = [];
  @Input() nodeStates: Record<string, NodeStatus> = {};
  @Input() currentNode: string | null | undefined;
  @Input() selectedNode: string | null = null;
  @Output() nodeSelect = new EventEmitter<string>();

  /** Main spine for layout (exclude conditional retry/escalation branches). */
  get mainNodes(): GraphNode[] {
    const side = new Set(['apply_retry', 'escalate']);
    return this.nodes.filter((n) => !side.has(n.id));
  }

  get sideNodes(): GraphNode[] {
    const side = new Set(['apply_retry', 'escalate']);
    return this.nodes.filter((n) => side.has(n.id));
  }

  get conditionalPaths(): string[] {
    const labels = new Map(this.nodes.map((node) => [node.id, node.label]));
    return this.edges
      .filter((edge) => edge.conditional)
      .map((edge) => `${labels.get(edge.source) || edge.source} → ${labels.get(edge.target) || edge.target}`);
  }

  statusOf(id: string): NodeStatus {
    return this.nodeStates[id] || 'pending';
  }

  select(id: string): void {
    this.nodeSelect.emit(id);
  }
}
