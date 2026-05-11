import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { RoleContextService } from './shared/services/role-context.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, AsyncPipe, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('BCP');
  constructor(public roleContext: RoleContextService) {}
}
