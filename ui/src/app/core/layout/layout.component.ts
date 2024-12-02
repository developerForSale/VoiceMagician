import { Component } from '@angular/core';
import { VmTabsComponent } from './vm-tabs/vm-tabs.component';
import { VmFooterComponent } from './vm-footer/vm-footer.component';

@Component({
    selector: 'app-layout',
    imports: [VmTabsComponent, VmFooterComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
