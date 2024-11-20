import { Component } from '@angular/core';
import { TickerComponent } from "../../notification/ticker/ticker.component";
import { VmStatusComponent } from "../../vm-status/vm-status.component";
import { NotificationComponent } from "../../notification/notification.component";

@Component({
  selector: 'app-vm-footer',
  standalone: true,
  imports: [VmStatusComponent, NotificationComponent],
  templateUrl: './vm-footer.component.html',
  styleUrl: './vm-footer.component.css'
})
export class VmFooterComponent {

}
