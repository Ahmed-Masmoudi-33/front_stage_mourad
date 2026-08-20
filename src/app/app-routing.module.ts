import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RunsListComponent } from './features/runs-list/runs-list.component';
import { RunDetailComponent } from './features/run-detail/run-detail.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'runs' },
  { path: 'runs', component: RunsListComponent },
  { path: 'runs/:id', component: RunDetailComponent },
  { path: '**', redirectTo: 'runs' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
