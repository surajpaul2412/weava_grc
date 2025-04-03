import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationModalComponent } from '../notification-modal/notification-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: []
})
export class HeaderComponent {
  @Input() activeFolderName: string = ''; // ✅ Receive active folder name

  constructor(private modalService: NgbModal) {}

  openNotificationModal() {
    this.modalService.open(NotificationModalComponent, {
      centered: true
    });
  }
}
