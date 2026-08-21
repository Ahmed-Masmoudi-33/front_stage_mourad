export type NodeStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'skipped'
  | 'awaiting_approval';

export type RunStatus =
  | 'queued'
  | 'running'
  | 'awaiting_approval'
  | 'done'
  | 'escalated'
  | 'failed'
  | 'cancelled';

export interface AgentOutput {
  agent: string;
  timestamp: string;
  summary: string;
  prompt_for_next?: string;
}

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  conditional?: boolean;
}

export interface GraphTopology {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RunSummary {
  run_id: string;
  thread_id: string;
  jira_key: string;
  repo_url?: string | null;
  status: RunStatus;
  current_node?: string | null;
  started_at: string;
  finished_at?: string | null;
  error?: string | null;
  risk_level?: string | null;
}

export type ToolCallStatus = 'running' | 'completed' | 'error' | 'unknown' | string;

export interface ToolCall {
  call_id: string;
  node: string;
  name: string;
  server: string;
  status: ToolCallStatus;
  allowed: boolean;
  args?: unknown;
  result?: unknown;
  started_at?: string | null;
  completed_at?: string | null;
}

export interface RunDetail extends RunSummary {
  node_states: Record<string, NodeStatus>;
  agent_outputs: AgentOutput[];
  artifacts: Record<string, unknown>;
  events: PipelineEvent[];
  tool_calls: ToolCall[];
}

export interface PipelineEvent {
  type: string;
  run_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface MessageResponse {
  ok: boolean;
  message: string;
  run?: RunDetail;
}
