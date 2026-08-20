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
    analyze: ['analysis'],
    plan: ['plan', 'risk_level'],
    await_approval: ['plan', 'risk_level'],
    implement: ['branch_name', 'changed_files', 'implementation_summary'],
    review: ['review_result', 'review_comments', 'pr_url', 'pr_number'],
    escalate: ['status', 'retry_count'],
    apply_retry: ['retry_count'],
  };

  get entries(): Array<{ key: string; value: string }> {
    const keys = this.focusNode && this.nodeFields[this.focusNode]
      ? this.nodeFields[this.focusNode]
      : [
          'ticket_summary',
          'triage_result',
          'analysis',
          'plan',
          'risk_level',
          'branch_name',
          'changed_files',
          'implementation_summary',
          'review_result',
          'review_comments',
          'pr_url',
          'pr_number',
          'retry_count',
          'repo_url',
          'repo_owner',
          'repo_name',
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

  isUrl(key: string, value: string): boolean {
    return key === 'pr_url' && /^https?:\/\//.test(value);
  }
}
