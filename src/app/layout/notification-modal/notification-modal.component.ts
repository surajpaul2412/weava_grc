import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule], // Import CommonModule here
  templateUrl: './notification-modal.component.html', // Reference the HTML file
})
export class NotificationModalComponent implements OnInit {
  activeTab = 0; // Default tab is "All Notifications"
  activePill = 'read'; // Default filter is "Read"
  notifications: any[] = [];
  invitations: any[] = [];
  isLoadingAll = false; // Manage loading state for "All"
  isLoadingInvitations = false; // Manage loading state for "Invitations"

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpClient // Inject HttpClient
  ) {}

  ngOnInit() {
    this.fetchNotifications(); // Initially fetch notifications when the component is loaded
  }

  // Method to set the active tab and fetch data when the tab is changed
  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    if (this.activeTab === 0) {
      this.fetchNotifications(); // Fetch all notifications when this tab is active
    } else if (this.activeTab === 1) {
      this.fetchInvitations(); // Fetch invitations when the "Invitation to Collaborate" tab is active
    }
  }

  // Method to filter notifications by pill
  filterBy(pill: string) {
    this.activePill = pill;
  }

  // Fetch notifications from API
  fetchNotifications() {
    this.isLoadingAll = true; // Set loading to true
    this.http.get<any[]>('https://weavadev1.azurewebsites.net/notification').subscribe(
      (response) => {
        this.notifications = response;
        this.isLoadingAll = false; // Set loading to false after fetching data
      },
      (error) => {
        console.error('Error fetching notifications', error);
        this.isLoadingAll = false; // Set loading to false in case of error
      }
    );
  }

  // Fetch invitations from another API
  fetchInvitations() {
    this.isLoadingInvitations = true; // Set loading to true
    this.http.get<any[]>('https://weavadev1.azurewebsites.net/notification').subscribe(
      (response) => {
        this.invitations = response;
        this.isLoadingInvitations = false; // Set loading to false after fetching data
      },
      (error) => {
        console.error('Error fetching invitations', error);
        this.isLoadingInvitations = false; // Set loading to false in case of error
      }
    );
  }
}
