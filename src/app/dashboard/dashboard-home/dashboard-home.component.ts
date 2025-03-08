import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FooterComponent } from '../../layout/footer/footer.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AzureBlobService } from '../../services/azure-blob.service'; // ✅ Import Service

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
  imports: [
    CommonModule,
    FooterComponent,
    HeaderComponent,
    SidebarComponent,
    NgxExtendedPdfViewerModule,
    FontAwesomeModule,
    NgbModule
  ]
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  folders: any[] = [];
  activeFolderId: string | null = null;
  activeFolderName: string = 'No Folder Selected';
  folderDetails: any = null; // ✅ Store folder details
  selectedTab: string = 'highlights';
  PdfView: boolean = false;
  alertVisible: boolean = true;
  uploadProgress: any = 0;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private azureBlobService: AzureBlobService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const folderId = params['folder'] || null;
      this.activeFolderId = folderId;
      this.updateActiveFolderName();

      // ✅ Fetch details only if folders are already loaded
      // if (this.folders.length > 0 && this.activeFolderId) {
      //   this.fetchFolderDetails(this.activeFolderId);
      // }
    });

    this.fetchFolders();
  }

  switchTab(tab: string) {
    this.selectedTab = tab;
  }

  showPdfView() {
    this.PdfView = true;
  }

  hidePdfView() {
    this.PdfView = false;
  }

  closeAlert() {
    this.alertVisible = false;
  }

  // ✅ Runs after the view is initialized
  ngAfterViewInit(): void {
    const pdfContainer = document.getElementById('pdf-container');
    if (pdfContainer) {
      pdfContainer.addEventListener('mouseup', this.logSelectedText);
    }
  }

  // ✅ Detect selected text inside PDF
  logSelectedText(): void {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      console.log("Selected text:", selectedText);
    }
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

          if (!this.activeFolderId) {
            // ✅ Set the first folder as active and update the URL
            const firstFolderId = this.folders[0].folderId;
            this.setActiveFolder(firstFolderId, false); // ✅ Ensure URL reflects change
          } else {
            this.updateActiveFolderName();

            // ✅ Prevent double calls
            if (!this.folderDetails || this.folderDetails.folderId !== this.activeFolderId) {
              this.fetchFolderDetails(this.activeFolderId);
            }
          }

          console.log('✅ Folders fetched successfully:', this.folders);
        } else {
          console.error('🚨 Unexpected API response:', response);
        }
      },
      (error) => {
        console.error('❌ Error fetching folders:', error);
      }
    );
  }

  // ✅ Set Active Folder and Update URL
  setActiveFolder(folderId: string | null, isInitialLoad = false) {
    if (!folderId) return;

    this.activeFolderId = folderId;    
    this.updateActiveFolderName();
    this.fetchFolderDetails(folderId);

    // ✅ Ensure the URL is updated correctly when setting the first folder
    this.router.navigate([], { queryParams: { folder: folderId }, queryParamsHandling: 'merge' });
  }

  // ✅ Update Active Folder Name
  updateActiveFolderName() {
    let activeFolder = this.folders.find((folder: any) => folder.folderId === this.activeFolderId);

    if (!activeFolder) {
        // If not found in top-level folders, search in subfolders
        for (const folder of this.folders) {
            activeFolder = folder.subfolders?.find((subfolder: any) => subfolder.folderId === this.activeFolderId);
            if (activeFolder) break; // Stop searching if found
        }
    }

    this.activeFolderName = activeFolder ? activeFolder.title : 'No Folder Selected';
}

  // ✅ Fetch Folder Details
  fetchFolderDetails(folderId: string | null) {
    if (!folderId) return;

    const user = this.authService.getUser();
    if (!user || !user.authToken) {
      console.error('🚨 No token found, unable to fetch folder details.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${user.authToken}`);

    this.http.get<any>(`https://weavadev1.azurewebsites.net/folders/${folderId}`, { headers }).subscribe(
      (response) => {
        if (response.statusCode === 200) {
          this.folderDetails = response.folderDetails;
          console.log('✅ Folder details fetched successfully:', this.folderDetails);
        } else {
          console.error('🚨 Unexpected API response:', response);
        }
      },
      (error) => {
        console.error('❌ Error fetching folder details:', error);
      }
    );
  }

  // ✅ Function to log uploaded file(s) to console
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      console.error("🚨 No file selected!");
      return;
    }
  
    if (!this.activeFolderId) {
      console.error("❌ No active folder ID found!");
      return;
    }
  
    const files = Array.from(input.files);
    let uploadedCount = 0;
    const totalFiles = files.length;
    this.uploadProgress = `0/${totalFiles}`;
  
    for (const file of files) {
      console.log("📂 Uploading file:", file.name);
  
      try {
        const isUploaded = await this.azureBlobService.uploadFile(file, this.activeFolderId);
        if (isUploaded) {
          uploadedCount++;
          this.uploadProgress = `${uploadedCount}/${totalFiles}`;
          console.log(`✅ File uploaded successfully: ${file.name}`);
        } else {
          console.error(`❌ File upload failed: ${file.name}`);
        }
  
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`🚨 Error uploading file ${file.name}:`, error);
      }
    }
  
    this.uploadProgress = `Completed: ${uploadedCount}/${totalFiles}`;
    input.value = '';
    this.fetchFolderDetails(this.activeFolderId);
  }
  
}
