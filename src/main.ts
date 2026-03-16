import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';

// Fix: "Uncaught ReferenceError: global is not defined" (SockJS/StompJS)
(window as any).global = window;

bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
