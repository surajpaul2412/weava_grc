import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, FontAwesomeModule]
})
export class SidebarComponent {
  @Input() folders: any[] = [];
  @Input() activeFolderId: string | null = null;
  @Output() folderSelected = new EventEmitter<string>();

  isProfileVisible: boolean = false;
  dimBG: boolean = false;

  setFolder(folderId: string) {
    this.folderSelected.emit(folderId);
  }

  toggleProfile() {
    this.isProfileVisible = !this.isProfileVisible;
    this.dimBG = !this.dimBG;
  }
}
