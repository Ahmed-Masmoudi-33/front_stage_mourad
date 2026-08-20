import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  GraphTopology,
  MessageResponse,
  RunDetail,
  RunSummary,
} from './models';

@Injectable({ providedIn: 'root' })
export class PipelineApiService {
  private readonly base = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getGraph(): Observable<GraphTopology> {
    return this.http.get<GraphTopology>(`${this.base}/graph`);
  }

  listRuns(): Observable<RunSummary[]> {
    return this.http.get<RunSummary[]>(`${this.base}/runs`);
  }

  getRun(runId: string): Observable<RunDetail> {
    return this.http.get<RunDetail>(`${this.base}/runs/${runId}`);
  }

  createRun(jiraKey: string, repoUrl: string): Observable<RunDetail> {
    return this.http.post<RunDetail>(`${this.base}/runs`, {
      jira_key: jiraKey,
      repo_url: repoUrl,
    });
  }

  approve(runId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/runs/${runId}/approve`, {});
  }

  cancel(runId: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/runs/${runId}/cancel`, {});
  }
}
