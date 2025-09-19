import { Component, signal } from '@angular/core';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { SidebarLink } from '../../core/models/sidebar.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Header, Sidebar],
  templateUrl: './dashboard.html',
  styles: ``
})
export class Dashboard {
  protected readonly sidebarLinks = signal<SidebarLink[]>(
    [
      {
        image: 'images/side-icon-1.svg',
        title: 'Dashboard'
      },
      {
        image: 'images/side-icon-2.svg',
        title: 'Lists'
      },
      {
        image: 'images/side-icon-3.svg',
        title: 'Support'
      },
      {
        image: 'images/side-icon-4.svg',
        title: 'Users'
      },
    ]
  )
}
