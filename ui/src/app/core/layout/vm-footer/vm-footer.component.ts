import { Component } from '@angular/core';
import { VmStatusComponent } from "../../vm-status/vm-status.component";
import { EventsComponent } from '../../events/events.component';

@Component({
    selector: 'app-vm-footer',
    imports: [VmStatusComponent, EventsComponent],
    templateUrl: './vm-footer.component.html',
    styleUrl: './vm-footer.component.css'
})
export class VmFooterComponent {

}
