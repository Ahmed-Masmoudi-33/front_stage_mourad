import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgentOutput, PipelineEvent } from '../../../core/models';

@Component({
  selector: 'app-run-timeline',
  templateUrl: './run-timeline.component.html',
  styleUrls: ['./run-timeline.component.css'],
})
export class RunTimelineComponent {
  @Input() outputs: AgentOutput[] = [];
  @Input() events: PipelineEvent[] = [];
  @Input() filterAgent: string | null = null;

  constructor(private readonly snack: MatSnackBar) {}

  get filteredOutputs(): AgentOutput[] {
    const mapped = (agent: string) => (agent === 'human_gate' ? 'await_approval' : agent);
    if (!this.filterAgent) {
      return this.outputs;
    }
    return this.outputs.filter((o) => mapped(o.agent) === this.filterAgent || o.agent === this.filterAgent);
  }

  get recentEvents(): PipelineEvent[] {
    const skip = new Set(['state_updated']);
    let list = this.events.filter((e) => !skip.has(e.type));
    if (this.filterAgent) {
      list = list.filter((e) => {
        const node = (e.payload?.['node'] as string) || (e.payload?.['output'] as AgentOutput | undefined)?.agent;
        const mapped = node === 'human_gate' ? 'await_approval' : node;
        return mapped === this.filterAgent || e.type === 'awaiting_approval';
      });
    }
    return list.slice().reverse().slice(0, 40);
  }

  agentLabel(agent: string): string {
    return agent.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async copyOutput(output: AgentOutput): Promise<void> {
    const text = (output.summary || '').trim();
    if (!text) {
      this.snack.open('Nothing to copy', 'Dismiss', { duration: 2000 });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      this.snack.open('Copy failed — check clipboard permissions', 'Dismiss', { duration: 3000 });
      return;
    }
    this.snack.open(`Copied ${this.agentLabel(output.agent)} output`, 'Dismiss', { duration: 2000 });
  }
}
