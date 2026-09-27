import { Component, signal } from '@angular/core';

import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { filter } from 'rxjs';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  protected readonly title = signal('quality-control');
  showNavbar = false;

  constructor(private router: Router) {

    this.router.events
      .pipe(
        filter(
          (event) => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {

        this.showNavbar =
          event.urlAfterRedirects !== '/login' &&
          event.urlAfterRedirects !== '/signup';

      });
  }
}
