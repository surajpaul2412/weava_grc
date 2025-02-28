import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  @Output() tabChanged = new EventEmitter<string>();

  changeTab(tab: string) {
    this.tabChanged.emit(tab);
  }
}
