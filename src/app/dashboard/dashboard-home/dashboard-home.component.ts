import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
  imports: [
    CommonModule,
    FooterComponent,
    HeaderComponent,
    SidebarComponent
  ]
})
export class DashboardHomeComponent implements OnInit {
  folders: any[] = [];
  activeFolderId: string | null = null;
  activeFolderName: string = 'No Folder Selected'; // ✅ Default folder name

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['folder']) {
        this.activeFolderId = params['folder'];
        this.updateActiveFolderName();
      }
    });

    this.fetchFolders();
  }

  fetchFolders() {
    const user = this.authService.getUser();
    if (!user || !user.authToken) {
      console.error('No token found, unable to fetch folders.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${user.authToken}`);

    this.http.get<any>('https://weavadev1.azurewebsites.net/folders', { headers }).subscribe(
      (response) => {
        if (response.statusCode === 200 && response.folderList.length > 0) {
          this.folders = response.folderList;

          // ✅ If no folder is active, set the first one
          if (!this.activeFolderId) {
            this.setActiveFolder(this.folders[0].folderId);
          } else {
            this.updateActiveFolderName();
          }

          console.log('Folders fetched successfully:', this.folders);
        } else {
          console.error('Unexpected API response:', response);
        }
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
  }

  // ✅ Set Active Folder and Update URL
  setActiveFolder(folderId: string) {
    this.activeFolderId = folderId;
    this.updateActiveFolderName();
    this.router.navigate([], { queryParams: { folder: folderId }, queryParamsHandling: 'merge' });
  }

  // ✅ Update Active Folder Name
  updateActiveFolderName() {
    const activeFolder = this.folders.find(folder => folder.folderId === this.activeFolderId);
    this.activeFolderName = activeFolder ? activeFolder.title : 'No Folder Selected';
  }
}
