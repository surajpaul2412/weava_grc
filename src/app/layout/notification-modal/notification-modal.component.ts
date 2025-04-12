import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.css'],
})
export class NotificationModalComponent implements OnInit {
  activeTab = 0;
  activePill = 'read';
  notifications: any[] = [];
  invitations: any[] = []; // Static or mocked for now
  isLoadingAll = false;
  isLoadingInvitations = false;

  constructor(
    public activeModal: NgbActiveModal,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.setActiveTab(0); // Only call fetchNotifications initially
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    if (tabIndex === 0) {
      this.fetchNotifications(); // Real API for "All"
    } else if (tabIndex === 1) {
      this.fetchInvitations(); // Can use static or mock for now
    }
  }

  filterBy(pill: string) {
    this.activePill = pill;
  }

  private getAuthHeaders(): HttpHeaders {
    const user = localStorage.getItem('user');
    if (!user) {
      console.error('⚠️ User not found in localStorage');
      return new HttpHeaders();
    }

    const parsedUser = JSON.parse(user);
    return new HttpHeaders().set('Authorization', `Bearer ${parsedUser.authToken}`);
  }

  fetchNotifications() {
    this.isLoadingAll = true;
    const headers = this.getAuthHeaders();

    this.http.get<any>('https://weavadev1.azurewebsites.net/notification', { headers }).subscribe(
      (response) => {
        console.log("All notification", response);
        this.notifications = response.data; // ✅ extract 'data' array
        this.isLoadingAll = false;
      },
      (error) => {
        console.error('❌ Error fetching notifications', error);
        this.isLoadingAll = false;
      }
    );    
  }

  fetchInvitations() {
    this.isLoadingInvitations = true;
    const headers = this.getAuthHeaders();
  
    this.http.get<any>('https://weavadev1.azurewebsites.net/collaboration/folders/invite', { headers }).subscribe(
      (response) => {
        console.log('📬 Invitations:', response);
        this.invitations = response || []; // Adjust based on actual API structure
        this.isLoadingInvitations = false;
      },
      (error) => {
        console.error('❌ Error fetching invitations:', error);
        this.invitations = [];
        this.isLoadingInvitations = false;
      }
    );
  }  

  viewNotification(note: any) {
    console.log('👁 View clicked:', note);
    // TODO: navigate or display full detail
  }
  
  deleteNotification(note: any) {
    console.log('🗑 Delete clicked:', note);
    // TODO: implement delete logic with confirmation
  }
  
}
