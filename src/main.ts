import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// Register locale data for Pt-Br (DatePipe, etc.)
registerLocaleData(localePt, 'pt-BR');

// Fix: "Uncaught ReferenceError: global is not defined" (SockJS/StompJS)
(window as any).global = window;

bootstrapApplication(AppComponent, appConfig)
    .catch(err => console.error(err));
