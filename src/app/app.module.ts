import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MarkdownModule } from 'ngx-markdown';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StatusBadgeComponent } from './shared/status-badge.component';
import { RunsListComponent } from './features/runs-list/runs-list.component';
import { RunLaunchDialogComponent } from './features/run-launch/run-launch-dialog.component';
import { RunDetailComponent } from './features/run-detail/run-detail.component';
import { PipelineGraphComponent } from './features/run-detail/graph/pipeline-graph.component';
import { RunTimelineComponent } from './features/run-detail/timeline/run-timeline.component';
import { RunArtifactsComponent } from './features/run-detail/artifacts/run-artifacts.component';
import { McpToolsComponent } from './features/run-detail/tools/mcp-tools.component';
import { ApprovalPanelComponent } from './features/run-detail/approval/approval-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    StatusBadgeComponent,
    RunsListComponent,
    RunLaunchDialogComponent,
    RunDetailComponent,
    PipelineGraphComponent,
    RunTimelineComponent,
    RunArtifactsComponent,
    McpToolsComponent,
    ApprovalPanelComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MarkdownModule.forRoot(),
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
