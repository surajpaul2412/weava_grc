import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule] // ✅ Add CommonModule to imports
})
export class SidebarComponent {
  @Input() folders: any[] = []; // ✅ Receive folders from Dashboard
}
