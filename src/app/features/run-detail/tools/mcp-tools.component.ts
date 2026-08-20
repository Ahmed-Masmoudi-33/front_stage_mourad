import { Component, Input } from '@angular/core';
import { ToolCall } from '../../../core/models';

interface ToolGroup {
  node: string;
  calls: ToolCall[];
}

@Component({
  selector: 'app-mcp-tools',
  templateUrl: './mcp-tools.component.html',
  styleUrls: ['./mcp-tools.component.css'],
})
export class McpToolsComponent {
  @Input() toolCalls: ToolCall[] = [];
  @Input() filterNode: string | null = null;

  expanded = new Set<string>();

  get filteredCalls(): ToolCall[] {
    const calls = this.toolCalls || [];
    if (!this.filterNode) {
      return calls;
    }
    return calls.filter((c) => c.node === this.filterNode);
  }

  get groups(): ToolGroup[] {
    const byNode = new Map<string, ToolCall[]>();
    for (const call of this.filteredCalls) {
      const node = call.node || 'unknown';
      const list = byNode.get(node) || [];
      list.push(call);
      byNode.set(node, list);
    }
    return [...byNode.entries()].map(([node, calls]) => ({ node, calls }));
  }

  get totalCount(): number {
    return this.filteredCalls.length;
  }

  nodeLabel(node: string): string {
    return node.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  key(call: ToolCall): string {
    return `${call.node}:${call.call_id}`;
  }

  isExpanded(call: ToolCall): boolean {
    return this.expanded.has(this.key(call));
  }

  toggle(call: ToolCall): void {
    const key = this.key(call);
    if (this.expanded.has(key)) {
      this.expanded.delete(key);
    } else {
      this.expanded.add(key);
    }
  }

  hasDetails(call: ToolCall): boolean {
    return call.args !== undefined && call.args !== null;
  }

  argsPreview(call: ToolCall): string {
    if (call.args === undefined || call.args === null) {
      return '';
    }
    if (typeof call.args !== 'object') {
      return String(call.args);
    }
    const entries = Object.entries(call.args as Record<string, unknown>);
    if (!entries.length) {
      return '';
    }
    return entries
      .slice(0, 3)
      .map(([k, v]) => `${k}=${this.short(v)}`)
      .join(' · ');
  }

  details(call: ToolCall): string {
    return JSON.stringify({ args: call.args ?? null, result: call.result ?? null }, null, 2);
  }

  durationMs(call: ToolCall): number | null {
    if (!call.started_at || !call.completed_at) {
      return null;
    }
    const ms = Date.parse(call.completed_at) - Date.parse(call.started_at);
    return Number.isFinite(ms) && ms >= 0 ? ms : null;
  }

  statusIcon(call: ToolCall): string {
    switch (call.status) {
      case 'completed':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'running':
        return 'sync';
      default:
        return 'help';
    }
  }

  private short(value: unknown): string {
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return text.length > 40 ? `${text.slice(0, 40)}…` : text;
  }
}
