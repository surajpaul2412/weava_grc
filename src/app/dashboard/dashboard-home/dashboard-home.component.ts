import { Component } from '@angular/core';
import { HeaderComponent } from '../../layout/header/header.component';
import { SidebarComponent } from '../../layout/sidebar/sidebar.component';
import { FooterComponent } from '../../layout/footer/footer.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'], // ✅ Use CSS instead of SCSS
  imports: [HeaderComponent, SidebarComponent, FooterComponent] // ✅ Import SidebarComponent
})
export class DashboardHomeComponent {}
