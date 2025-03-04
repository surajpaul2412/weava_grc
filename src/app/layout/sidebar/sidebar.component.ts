import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule]
})
export class SidebarComponent implements OnInit {
  @Input() folders: any[] = [];
  @Input() activeFolderId: string | null = null;
  @Output() folderSelected = new EventEmitter<string>();
  @Output() folderCreated = new EventEmitter<void>();
  createFolderForm: FormGroup;

  isProfileVisible: boolean = false;
  dimBG: boolean = false;
  userName: string | null = null;

  constructor(private router: Router, private http: HttpClient, private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.createFolderForm = this.fb.group({ title: ['', Validators.required] });
  }

  ngOnInit() {
    this.loadUserData();
    this.refreshFolders();
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

  refreshFolders() {
    const user = localStorage.getItem('user');
    if (!user) return console.error('User not found in localStorage');
    
    const parsedUser = JSON.parse(user);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${parsedUser.authToken}`);

    this.http.get<any>('https://weavadev1.azurewebsites.net/folders', { headers }).subscribe(
      (response) => {
        if (response.statusCode === 200 && response.folderList.length > 0) {
          this.folders = response.folderList;
          console.log('✅ Folders refreshed:', this.folders);
        } else {
          console.error('🚨 Unexpected API response:', response);
        }
      },
      error => console.error('❌ Error fetching folders:', error)
    );
  }

  setFolder(folderId: string, event?: Event) {
    if (event) event.stopPropagation();
    if (this.activeFolderId === folderId) return;
    
    this.activeFolderId = folderId;
    this.folderSelected.emit(folderId);
  }

  createFolder() {
    if (this.createFolderForm.invalid) return;
    const user = localStorage.getItem('user');
    if (!user) return console.error('User not found in localStorage');

    const parsedUser = JSON.parse(user);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${parsedUser.authToken}`);
    const folderData = { title: this.createFolderForm.value.title };

    this.http.post('https://weavadev1.azurewebsites.net/folders/root', folderData, { headers }).subscribe(
      () => {
        this.createFolderForm.reset({ title: '' }); // ✅ Clear input field after submission
        this.folderCreated.emit(); // Notify parent component
        this.refreshFolders(); // ✅ Refresh the folder list
        this.showToast('Folder created successfully', 'success');
      },
      error => console.error('❌ Error creating folder:', error)
    );
  }

  showToast(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'success-toast' : 'error-toast'
    });
  }

  toggleProfile() {
    this.isProfileVisible = !this.isProfileVisible;
    this.dimBG = !this.dimBG;
  }

  signout() {
    localStorage.removeItem('user');
    this.activeFolderId = null;
    this.router.navigate(['/login']); 
  }
}
