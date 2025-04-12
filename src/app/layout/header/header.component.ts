import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Import this

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [CommonModule]
})
export class HeaderComponent implements OnInit {
  @Input() activeFolderName: string = '';
  notificationCount: number = 0;

  constructor(private modalService: NgbModal, private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchNotificationCount();
  }

  fetchNotificationCount() {
    const user = localStorage.getItem('user');
    if (!user) return;
  
    const parsedUser = JSON.parse(user);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${parsedUser.authToken}`);
  
    this.http.get<{ message: string, data: { count: number } }>('https://weavadev1.azurewebsites.net/notification/count', { headers })
      .subscribe({
        next: (res) => {
          this.notificationCount = res.data?.count || 0;
        },
        error: (err) => {
          console.error('❌ Failed to fetch notification count', err);
        }
      });
  }  

  openNotificationModal() {
    this.modalService.open(NotificationModalComponent, { centered: true });
  }
}
