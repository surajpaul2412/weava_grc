import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
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
    CommonModule, // ✅ Required for *ngIf and other directives
    FooterComponent,
    HeaderComponent,
    SidebarComponent
  ]
})
export class DashboardHomeComponent implements OnInit {
  folders: any[] = []; // ✅ Store folders for sidebar

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.fetchFolders(); // ✅ Fetch folders immediately after login
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
        if (response.statusCode === 200 && response.folderList) {
          this.folders = response.folderList; // ✅ Extract folderList from response
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
}
