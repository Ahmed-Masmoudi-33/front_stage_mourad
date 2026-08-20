import { Component, Input } from '@angular/core';
import { RunStatus, NodeStatus } from '../core/models';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [attr.data-status]="status">{{ label }}</span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.15rem 0.55rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        background: #e8eaed;
        color: #3c4043;
      }
      .badge[data-status='running'],
      .badge[data-status='queued'] {
        background: #e8f0fe;
        color: #1967d2;
      }
      .badge[data-status='done'],
      .badge[data-status='success'] {
        background: #e6f4ea;
        color: #137333;
      }
      .badge[data-status='awaiting_approval'] {
        background: #fef7e0;
        color: #b06000;
      }
      .badge[data-status='failed'],
      .badge[data-status='cancelled'],
      .badge[data-status='escalated'] {
        background: #fce8e6;
        color: #c5221f;
      }
      .badge[data-status='skipped'],
      .badge[data-status='pending'] {
        background: #f1f3f4;
        color: #5f6368;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() status: RunStatus | NodeStatus | string = 'pending';

  get label(): string {
    return (this.status || 'pending').replace(/_/g, ' ');
  }
}
