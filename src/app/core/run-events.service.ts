import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PipelineEvent } from './models';

@Injectable({ providedIn: 'root' })
export class RunEventsService {
  constructor(private readonly zone: NgZone) {}

  stream(runId: string): Observable<PipelineEvent> {
    return new Observable<PipelineEvent>((subscriber) => {
      const url = `${environment.apiUrl}/runs/${runId}/events`;
      const source = new EventSource(url);
      const terminal = new Set(['run_completed', 'run_failed', 'run_cancelled']);

      const forward = (raw: MessageEvent) => {
        try {
          const data = JSON.parse(raw.data) as PipelineEvent;
          this.zone.run(() => {
            subscriber.next(data);
            if (terminal.has(data.type)) {
              source.close();
              subscriber.complete();
            }
          });
        } catch {
          // ignore malformed chunks
        }
      };

      source.onmessage = forward;
      // The server names every SSE event after its payload type, so onmessage
      // never fires; each type needs an explicit listener.
      [
        'run_started',
        'run_completed',
        'run_failed',
        'run_cancelled',
        'node_started',
        'node_finished',
        'state_updated',
        'awaiting_approval',
        'approval_granted',
        'agent_output',
        'agent_debug',
        'tool_call',
        'escalated',
      ].forEach((type) => source.addEventListener(type, forward as EventListener));

      source.onerror = () => {
        this.zone.run(() => {
          if (source.readyState === EventSource.CLOSED) {
            subscriber.complete();
          }
        });
      };

      return () => source.close();
    });
  }
}
