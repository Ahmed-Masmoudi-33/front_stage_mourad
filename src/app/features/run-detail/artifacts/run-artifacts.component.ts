import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-run-artifacts',
  templateUrl: './run-artifacts.component.html',
  styleUrls: ['./run-artifacts.component.css'],
})
export class RunArtifactsComponent {
  @Input() artifacts: Record<string, unknown> = {};
  @Input() focusNode: string | null = null;

  private readonly nodeFields: Record<string, string[]> = {
    triage: ['ticket_summary', 'triage_result'],
    analyze: ['analysis', 'affected_areas', 'acceptance_criteria', 'prompt_for_next'],
    plan: ['plan', 'risk_level', 'risk_reasons', 'files_to_change', 'prompt_for_next'],
    await_approval: ['plan', 'risk_level', 'risk_reasons'],
    implement: ['workspace_path', 'changed_files', 'implementation_summary'],
    review: ['review_result', 'review_comments', 'retry_count'],
    apply_retry: ['review_comments', 'retry_count', 'prompt_for_next'],
    publish: ['branch_name', 'commit_sha', 'pr_url', 'pr_number'],
    escalate: ['status', 'escalation_reason', 'escalation_message'],
  };

  get entries(): Array<{ key: string; value: string }> {
    const keys = this.focusNode && this.nodeFields[this.focusNode]
      ? this.nodeFields[this.focusNode]
      : [
          'ticket_summary',
          'triage_result',
          'analysis',
          'affected_areas',
          'acceptance_criteria',
          'plan',
          'risk_level',
          'risk_reasons',
          'files_to_change',
          'workspace_path',
          'changed_files',
          'implementation_summary',
          'review_result',
          'review_comments',
          'retry_count',
          'branch_name',
          'commit_sha',
          'pr_url',
          'pr_number',
          'escalation_reason',
          'escalation_message',
          'repo_url',
          'repo_owner',
          'repo_name',
          'default_branch',
        ];

    return keys
      .filter((k) => this.artifacts[k] !== undefined && this.artifacts[k] !== null && this.artifacts[k] !== '')
      .map((key) => ({
        key,
        value: this.format(this.artifacts[key]),
      }));
  }

  private format(value: unknown): string {
    if (Array.isArray(value)) {
      return value.join('\n');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  label(key: string): string {
    const labels: Record<string, string> = {
      workspace_path: 'Local workspace',
      changed_files: 'Changed files',
      implementation_summary: 'Implementation summary',
      review_result: 'Local review result',
      review_comments: 'Local review comments',
      retry_count: 'Review retries',
      branch_name: 'Published branch',
      commit_sha: 'Published commit',
      pr_url: 'Draft pull request',
      pr_number: 'Pull request number',
      files_to_change: 'Planned files',
      risk_level: 'Risk level',
      risk_reasons: 'Risk reasons',
      acceptance_criteria: 'Acceptance criteria',
      escalation_reason: 'Escalation reason',
      escalation_message: 'Escalation details',
      repo_url: 'GitHub repository',
    };
    return labels[key] || key.replace(/_/g, ' ');
  }

  isUrl(key: string, value: string): boolean {
    return (key === 'repo_url' || key === 'pr_url') && /^https?:\/\//.test(value);
  }
}
