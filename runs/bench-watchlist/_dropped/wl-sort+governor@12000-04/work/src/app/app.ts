import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { WatchlistStore } from './watchlist-store';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly store = inject(WatchlistStore);

  // A plain href="#main" would resolve against <base href> and trigger a navigation,
  // so move focus to <main> manually instead.
  skipToMain(event: Event) {
    event.preventDefault();
    document.getElementById('main')?.focus();
  }
}
