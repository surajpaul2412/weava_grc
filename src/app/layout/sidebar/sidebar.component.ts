import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule]
})
export class SidebarComponent {
  @Input() folders: any[] = [];
  @Input() activeFolderId: string | null = null;
  @Output() folderSelected = new EventEmitter<string>();

  setFolder(folderId: string) {
    this.folderSelected.emit(folderId);
  }
}
