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
  userName: string | null = null;

  constructor() {
    this.loadUserData();
  }

  loadUserData() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        this.userName = parsedUser.displayName || 'Guest'; 
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.userName = 'Guest';
      }
    } else {
      this.userName = 'Guest';
    }
  }

  setFolder(folderId: string, event?: Event) {
    // Prevent parent click event from triggering when clicking a subfolder
    if (event) {
      event.stopPropagation();
    }
  
    // Prevent double clicks from triggering quickly
    if (this.activeFolderId === folderId) {
      return; // Ignore if the same folder is clicked again
    }
  
    this.activeFolderId = folderId;
    this.folderSelected.emit(folderId);
  }  

  toggleProfile() {
    this.isProfileVisible = !this.isProfileVisible;
    this.dimBG = !this.dimBG;
  }
}