import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { PipelineApiService } from '../../core/pipeline-api.service';
import { RunEventsService } from '../../core/run-events.service';
import {
  AgentOutput,
  GraphTopology,
  NodeStatus,
  PipelineEvent,
  RunDetail,
  ToolCall,
} from '../../core/models';

@Component({
  selector: 'app-run-detail',
  templateUrl: './run-detail.component.html',
  styleUrls: ['./run-detail.component.css'],
})
export class RunDetailComponent implements OnInit, OnDestroy {
  run: RunDetail | null = null;
  graph: GraphTopology | null = null;
  selectedNode: string | null = null;
  loading = true;
  actionBusy = false;
  private sub?: Subscription;
  private eventsSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: PipelineApiService,
    private readonly events: RunEventsService,
    private readonly snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        return;
      }
      this.eventsSub?.unsubscribe();
      this.load(id);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.eventsSub?.unsubscribe();
  }

  get needsApproval(): boolean {
    return this.run?.status === 'awaiting_approval';
  }

  get canCancel(): boolean {
    const s = this.run?.status;
    return !!s && !['done', 'escalated', 'failed', 'cancelled'].includes(s);
  }

  get planText(): string {
    const art = this.run?.artifacts || {};
    return String(art['plan'] || '');
  }

  get riskReasons(): string[] {
    const reasons = this.run?.artifacts?.['risk_reasons'];
    return Array.isArray(reasons) ? reasons.map(String) : [];
  }

  get workspacePath(): string {
    return String(this.run?.artifacts?.['workspace_path'] || '');
  }

  get changedFileCount(): number {
    const files = this.run?.artifacts?.['changed_files'];
    return Array.isArray(files) ? files.length : 0;
  }

  get prUrl(): string {
    return String(this.run?.pr_url || this.run?.artifacts?.['pr_url'] || '');
  }

  private load(runId: string): void {
    this.loading = true;
    this.api.getGraph().subscribe({
      next: (g) => (this.graph = g),
      error: () => {
        this.graph = { nodes: [], edges: [] };
      },
    });

    this.api.getRun(runId).subscribe({
      next: (run) => {
        this.run = run;
        this.loading = false;
        this.connectEvents(runId);
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(err?.error?.detail || 'Run not found', 'Dismiss', { duration: 4000 });
        void this.router.navigate(['/runs']);
      },
    });
  }

  private connectEvents(runId: string): void {
    this.eventsSub = this.events.stream(runId).subscribe({
      next: (event) => this.applyEvent(event),
      error: () => {
        // keep last snapshot; user can refresh
      },
    });
  }

  private applyEvent(event: PipelineEvent): void {
    if (!this.run || event.run_id !== this.run.run_id) {
      return;
    }

    // Deduplicate by appending if not already last identical type+timestamp
    const last = this.run.events[this.run.events.length - 1];
    if (!last || last.timestamp !== event.timestamp || last.type !== event.type) {
      this.run.events = [...this.run.events, event];
    }

    const payload = event.payload || {};

    switch (event.type) {
      case 'node_started': {
        const node = payload['node'] as string;
        if (node) {
          this.run.current_node = node;
          this.patchNode(node, node === 'await_approval' ? 'awaiting_approval' : 'running');
        }
        break;
      }
      case 'node_finished': {
        const node = payload['node'] as string;
        if (node) {
          this.patchNode(node, payload['status'] === 'failed' ? 'failed' : 'success');
        }
        break;
      }
      case 'agent_output': {
        const output = payload['output'] as AgentOutput;
        const node = (payload['node'] as string) || output?.agent;
        if (output) {
          const exists = this.run.agent_outputs.some(
            (o) => o.timestamp === output.timestamp && o.agent === output.agent,
          );
          if (!exists) {
            this.run.agent_outputs = [...this.run.agent_outputs, output];
          }
        }
        if (node && node !== 'await_approval') {
          this.patchNode(node, 'success');
        }
        break;
      }
      case 'tool_call': {
        const call = payload['call'] as ToolCall | undefined;
        if (call) {
          this.upsertToolCall(call);
        }
        break;
      }
      case 'agent_debug': {
        const debug = payload['debug'] as Record<string, unknown> | undefined;
        if (debug) {
          const current = this.run.artifacts['agent_debug'];
          const entries = Array.isArray(current) ? current : [];
          this.run.artifacts = {
            ...this.run.artifacts,
            agent_debug: [...entries, debug],
            ...(debug['token_usage'] ? { token_usage: debug['token_usage'] } : {}),
          };
        }
        break;
      }
      case 'state_updated': {
        if (payload['node_states']) {
          this.run.node_states = {
            ...this.run.node_states,
            ...(payload['node_states'] as Record<string, NodeStatus>),
          };
        }
        if (payload['artifacts']) {
          this.run.artifacts = {
            ...this.run.artifacts,
            ...(payload['artifacts'] as Record<string, unknown>),
          };
        }
        if (payload['status']) {
          const st = payload['status'] as string;
          if (st === 'awaiting_approval') {
            this.run.status = 'awaiting_approval';
          } else if (st === 'done') {
            this.run.status = 'done';
          } else if (st === 'escalated') {
            this.run.status = 'escalated';
          } else if (this.run.status !== 'awaiting_approval' && this.run.status !== 'cancelled') {
            this.run.status = 'running';
          }
        }
        if (payload['current_node']) {
          this.run.current_node = payload['current_node'] as string;
        }
        break;
      }
      case 'awaiting_approval':
        this.run.status = 'awaiting_approval';
        this.run.current_node = 'await_approval';
        this.patchNode('await_approval', 'awaiting_approval');
        if (payload['risk_level']) {
          this.run.risk_level = String(payload['risk_level']);
        }
        this.run.artifacts = {
          ...this.run.artifacts,
          ...(payload['plan'] ? { plan: payload['plan'] } : {}),
          ...(payload['risk_level'] ? { risk_level: payload['risk_level'] } : {}),
          ...(payload['risk_reasons'] ? { risk_reasons: payload['risk_reasons'] } : {}),
        };
        break;
      case 'approval_granted':
        this.run.status = 'running';
        this.patchNode('await_approval', 'success');
        break;
      case 'escalated':
        this.run.status = 'escalated';
        this.patchNode('escalate', 'success');
        break;
      case 'run_completed':
        this.run.status = (payload['status'] as RunDetail['status']) || 'done';
        this.run.finished_at = event.timestamp;
        this.settle(payload);
        break;
      case 'run_failed':
        this.run.status = 'failed';
        this.run.error = String(payload['error'] || 'Run failed');
        this.run.finished_at = event.timestamp;
        this.settle(payload);
        break;
      case 'run_cancelled':
        this.run.status = 'cancelled';
        this.run.finished_at = event.timestamp;
        this.settle(payload);
        break;
      default:
        break;
    }
  }

  /**
   * Apply the reconciled snapshot that rides on terminal events, so nothing is
   * left pulsing or spinning once the run is over. Falls back to clearing
   * in-flight states locally when an older server omits the snapshot.
   */
  private settle(payload: Record<string, unknown>): void {
    if (!this.run) {
      return;
    }
    this.run.current_node = null;

    const nodeStates = payload['node_states'] as Record<string, NodeStatus> | undefined;
    if (nodeStates) {
      this.run.node_states = { ...this.run.node_states, ...nodeStates };
    } else {
      const resolved = this.run.status === 'failed' || this.run.status === 'cancelled' ? 'failed' : 'success';
      this.run.node_states = Object.fromEntries(
        Object.entries(this.run.node_states).map(([id, status]) => [
          id,
          status === 'running' ? resolved : status,
        ]),
      ) as Record<string, NodeStatus>;
    }

    const toolCalls = payload['tool_calls'] as ToolCall[] | undefined;
    this.run.tool_calls = toolCalls
      ? toolCalls
      : (this.run.tool_calls || []).map((c) =>
          c.status === 'running' ? { ...c, status: 'unknown' } : c,
        );
  }

  private upsertToolCall(call: ToolCall): void {
    if (!this.run) {
      return;
    }
    const calls = this.run.tool_calls || [];
    const idx = calls.findIndex((c) => c.node === call.node && c.call_id === call.call_id);
    this.run.tool_calls =
      idx >= 0
        ? [...calls.slice(0, idx), { ...calls[idx], ...call }, ...calls.slice(idx + 1)]
        : [...calls, call];
  }

  private patchNode(id: string, status: NodeStatus): void {
    if (!this.run) {
      return;
    }
    this.run.node_states = { ...this.run.node_states, [id]: status };
  }

  onSelectNode(id: string): void {
    this.selectedNode = this.selectedNode === id ? null : id;
  }

  clearFilter(): void {
    this.selectedNode = null;
  }

  approve(): void {
    if (!this.run) {
      return;
    }
    this.actionBusy = true;
    this.api.approve(this.run.run_id).subscribe({
      next: () => {
        this.actionBusy = false;
        this.snack.open('Approved — pipeline continuing', 'OK', { duration: 2500 });
      },
      error: (err) => {
        this.actionBusy = false;
        this.snack.open(err?.error?.detail || 'Approve failed', 'Dismiss', { duration: 4000 });
      },
    });
  }

  cancel(): void {
    if (!this.run) {
      return;
    }
    this.actionBusy = true;
    this.api.cancel(this.run.run_id).subscribe({
      next: (res) => {
        this.actionBusy = false;
        if (res.run) {
          this.run = res.run;
        }
        this.snack.open('Run cancelled', 'OK', { duration: 2500 });
      },
      error: (err) => {
        this.actionBusy = false;
        this.snack.open(err?.error?.detail || 'Cancel failed', 'Dismiss', { duration: 4000 });
      },
    });
  }

  refresh(): void {
    if (!this.run) {
      return;
    }
    this.api.getRun(this.run.run_id).subscribe({
      next: (run) => (this.run = run),
    });
  }

  back(): void {
    void this.router.navigate(['/runs']);
  }
}
