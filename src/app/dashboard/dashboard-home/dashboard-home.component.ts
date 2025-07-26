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
import { AzureBlobService } from '../../services/azure-blob.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../layout/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  selectedText: string = '';
  pdfUrl: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private azureBlobService: AzureBlobService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const folderId = params['folder'] || null;
      this.activeFolderId = folderId;
      this.updateActiveFolderName();
    });

    this.fetchFolders();
  }

  // Function to delete the folder
  deleteFolder(folderId: string, folderName: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { folderName: folderName }  // Pass folder name to dialog for confirmation
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Proceed with folder deletion
        this.deleteFolderApiCall(folderId);
      } else {
        // User cancelled, do nothing
        console.log('Folder deletion cancelled');
      }
    });
  }

  // Function to call the delete API
  deleteFolderApiCall(folderId: string) {
    const headers = this.getAuthHeaders();
    if (!headers) return;

    // API request to delete the folder
    this.http.delete(`https://weavadev1.azurewebsites.net/folders/${folderId}`, { headers }).subscribe(
      (response) => {
        this.snackBar.open('Folder deleted successfully!', 'Close', { duration: 3000 });
        // After deletion, refresh both the folder list (sidebar) and folder details
        this.fetchFolders();  // Refresh the sidebar
        this.fetchFolderDetails(this.activeFolderId); // Refresh the folder details after deletion
      },
      (error) => {
        console.error('Error deleting folder:', error);
        this.snackBar.open('Failed to delete folder.', 'Close', { duration: 3000 });
      }
    );
  }

  // Function to get Auth Headers
  private getAuthHeaders(): HttpHeaders | null {
    const user = localStorage.getItem('user');
    if (!user) {
      this.snackBar.open('User not logged in', 'Close', { duration: 3000 });
      return null;
    }
    const parsedUser = JSON.parse(user);
    return new HttpHeaders().set('Authorization', `Bearer ${parsedUser.authToken}`);
  }

  // Function to delete a file
  deleteFile(folderId: string, websiteId: string) {
    const deleteData = {
      folderId: folderId,
      websiteId: websiteId,
      isHosted: true
    };

    console.log(deleteData);

    const headers = this.getAuthHeaders();
    if (!headers) return;

    this.http.delete('https://weavadev1.azurewebsites.net/files/pdf', { 
      headers, 
      body: deleteData 
    }).subscribe({
      next: (response) => {
        this.snackBar.open('File deleted successfully!', 'Close', { duration: 3000 }); // ✅ Using snackBar for success
        console.log('File deleted successfully:', response);
        this.fetchFolderDetails(folderId);  // Refresh folder details after deletion
      },
      error: (err) => {
        console.error('Error deleting file:', err);
        this.snackBar.open('Failed to delete file.', 'Close', { duration: 3000 }); // ✅ Using snackBar for error
      }
    });
  }

  switchTab(tab: string) {
    this.selectedTab = tab;
  }

  showPdfView(url: string) {
    this.PdfView = true;
    this.pdfUrl = 'https://' + url;  // Dynamically set the PDF URL
    setTimeout(() => {
      this.addTextSelectionListener(); // Add text selection event listener
    }, 1000);
  }

  hidePdfView() {
    this.PdfView = false;
    this.removeTextSelectionListener(); // ✅ Remove text selection event listener
  }

  closeAlert() {
    this.alertVisible = false;
  }

  // ✅ Runs after the view is initialized
  ngAfterViewInit(): void {
    this.addTextSelectionListener();
  }

  ngOnDestroy(): void {
    this.removeTextSelectionListener(); // ✅ Clean up event listener on destroy
  }

  // ✅ Add Event Listener for Text Selection
  addTextSelectionListener() {
    document.addEventListener('mouseup', this.logSelectedText);
  }

  // ✅ Remove Event Listener when closing PDF
  removeTextSelectionListener() {
    document.removeEventListener('mouseup', this.logSelectedText);
  }

  // ✅ Function to Capture Selected Text
  logSelectedText = () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      console.log("📝 Selected Text:", selectedText);
    }
  };

  // Function to fetch folders
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
            const firstFolderId = this.folders[0].folderId;
            this.setActiveFolder(firstFolderId, false);
          } else {
            this.updateActiveFolderName();

            if (!this.folderDetails || this.folderDetails.folderId !== this.activeFolderId) {
              this.fetchFolderDetails(this.activeFolderId);
            }
          }
        } else {
          console.error('Unexpected API response:', response);
        }
      },
      (error) => {
        console.error('Error fetching folders:', error);
      }
    );
  }

  // Function to set active folder and update URL
  setActiveFolder(folderId: string | null, isInitialLoad = false) {
    if (!folderId) return;

    this.activeFolderId = folderId;
    this.updateActiveFolderName();
    this.fetchFolderDetails(folderId);

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
    // ✅ Hide progress after 2 seconds
    setTimeout(() => {
      this.uploadProgress = '';
    }, 2000);
  
    input.value = '';
    this.fetchFolderDetails(this.activeFolderId);
  }

  goToContributeWeava() {
    this.router.navigate(['/contribute-weava']); // Programmatically navigate to the signup page
  }
  
}
