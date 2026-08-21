import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface LaunchPipelineResult {
  jiraKey: string;
  repoUrl: string;
}

@Component({
  selector: 'app-run-launch-dialog',
  template: `
    <h2 mat-dialog-title>Launch pipeline</h2>
    <mat-dialog-content>
      <p class="hint">
        Analyze the GitHub repository, then implement locally in
        <code>workspaces/&lt;JIRA_KEY&gt;</code>.
      </p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Jira key</mat-label>
          <input matInput formControlName="jiraKey" placeholder="SCRUM-3" />
          <mat-error *ngIf="form.controls.jiraKey.invalid">Required (e.g. PROJ-123)</mat-error>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>GitHub repository (read-only)</mat-label>
          <input
            matInput
            formControlName="repoUrl"
            placeholder="https://github.com/owner/repo"
            (keyup.enter)="submit()"
          />
          <mat-hint>Used only by analyze and plan; implement never writes to GitHub</mat-hint>
          <mat-error *ngIf="form.controls.repoUrl.invalid">Required GitHub repository link</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="submit()">
        Start run
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .full {
        width: 100%;
        margin-top: 0.5rem;
      }
      .hint {
        margin: 0 0 0.5rem;
        color: #5f6368;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class RunLaunchDialogComponent {
  form = this.fb.group({
    jiraKey: [this.data?.jiraKey || '', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9]+-\d+$/)]],
    repoUrl: [
      this.data?.repoUrl || '',
      [Validators.required, Validators.pattern(/^(https?:\/\/(www\.)?github\.com\/.+|.+\/.+)$/i)],
    ],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly dialogRef: MatDialogRef<RunLaunchDialogComponent, LaunchPipelineResult>,
    @Inject(MAT_DIALOG_DATA) public data: { jiraKey?: string; repoUrl?: string } | null,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close({
      jiraKey: (this.form.value.jiraKey || '').trim().toUpperCase(),
      repoUrl: (this.form.value.repoUrl || '').trim(),
    });
  }
}
