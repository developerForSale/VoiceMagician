import { Component, Output } from '@angular/core';
import { LayoutComponent } from './core/layout/layout.component';

@Component({
    selector: 'app-root',
    imports: [LayoutComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  
}
