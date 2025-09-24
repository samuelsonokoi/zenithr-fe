import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { Header } from '../../components/header/header';
import { Sidebar } from '../../components/sidebar/sidebar';
import { SidebarLink } from '../../core/models/sidebar.model';
import { RouterLink } from '@angular/router';
import { ScenarioTableData } from '../../core/models/scenario-table.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Header, Sidebar, RouterLink],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
  );

  protected readonly searchTerm = signal<string>('');

  protected readonly tableData = signal<ScenarioTableData[]>([
    {
      name: 'Scenario A',
      respondents: 500,
      rangeStart: 0,
      rangeEnd: 100
    },
    {
      name: 'Scenario B',
      respondents: 400,
      rangeStart: 10,
      rangeEnd: 90
    },
    {
      name: 'Scenario C',
      respondents: 300,
      rangeStart: 20,
      rangeEnd: 80
    },
  ]);

  protected readonly filteredTableData = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) {
      return this.tableData();
    }

    return this.tableData().filter(scenario => {
      // Search in scenario name
      if (scenario.name.toLowerCase().includes(search)) {
        return true;
      }

      // Search in respondents count
      if (scenario.respondents.toString().includes(search)) {
        return true;
      }

      // Search in score range (both individual values and range format)
      const rangeString = `${scenario.rangeStart}-${scenario.rangeEnd}`;
      if (rangeString.includes(search) ||
          scenario.rangeStart.toString().includes(search) ||
          scenario.rangeEnd.toString().includes(search)) {
        return true;
      }

      return false;
    });
  });

  protected updateSearchTerm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
