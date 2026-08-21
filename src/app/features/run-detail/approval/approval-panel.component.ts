import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-approval-panel',
  templateUrl: './approval-panel.component.html',
  styleUrls: ['./approval-panel.component.css'],
})
export class ApprovalPanelComponent {
  @Input() visible = false;
  @Input() jiraKey = '';
  @Input() riskLevel: string | null | undefined;
  @Input() riskReasons: string[] = [];
  @Input() plan = '';
  @Input() busy = false;
  @Output() approve = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
