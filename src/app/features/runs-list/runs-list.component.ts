import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PipelineApiService } from '../../core/pipeline-api.service';
import { RunSummary, RunStatus } from '../../core/models';
import { RunLaunchDialogComponent } from '../run-launch/run-launch-dialog.component';

@Component({
  selector: 'app-runs-list',
  templateUrl: './runs-list.component.html',
  styleUrls: ['./runs-list.component.css'],
})
export class RunsListComponent implements OnInit {
  runs: RunSummary[] = [];
  loading = true;
  filter: 'all' | RunStatus = 'all';
  launching = false;

  readonly filters: Array<'all' | RunStatus> = [
    'all',
    'running',
    'awaiting_approval',
    'done',
    'escalated',
    'failed',
    'cancelled',
  ];

  constructor(
    private readonly api: PipelineApiService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly snack: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  get filtered(): RunSummary[] {
    if (this.filter === 'all') {
      return this.runs;
    }
    return this.runs.filter((r) => r.status === this.filter);
  }

  reload(): void {
    this.loading = true;
    this.api.listRuns().subscribe({
      next: (runs) => {
        this.runs = runs;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snack.open(err?.message || 'Failed to load runs', 'Dismiss', { duration: 4000 });
      },
    });
  }

  openLaunch(): void {
    const ref = this.dialog.open(RunLaunchDialogComponent, { width: '480px' });
    ref.afterClosed().subscribe((result) => {
      if (!result?.jiraKey || !result?.repoUrl) {
        return;
      }
      this.launching = true;
      this.api.createRun(result.jiraKey, result.repoUrl).subscribe({
        next: (run) => {
          this.launching = false;
          void this.router.navigate(['/runs', run.run_id]);
        },
        error: (err) => {
          this.launching = false;
          this.snack.open(err?.error?.detail || err?.message || 'Failed to start run', 'Dismiss', {
            duration: 5000,
          });
        },
      });
    });
  }

  openRun(run: RunSummary): void {
    void this.router.navigate(['/runs', run.run_id]);
  }
}
