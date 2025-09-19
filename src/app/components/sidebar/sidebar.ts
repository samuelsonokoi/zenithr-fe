import { Component, input } from '@angular/core';
import { SidebarLink } from '../../core/models/sidebar.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  sidebarLinks = input<SidebarLink[]>();
}
