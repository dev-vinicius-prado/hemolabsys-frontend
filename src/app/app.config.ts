import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';
import { provideFuse } from '@fuse';
import { provideTransloco, TranslocoService } from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';
import { appRoutes } from 'app/app.routes';
import { authInterceptor } from 'app/core/auth/auth.interceptor';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { mockApiServices } from 'app/mock-api';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';
import { mockApiInterceptor } from '@fuse/lib/mock-api';
import { fuseLoadingInterceptor } from '@fuse/services/loading';

import { provideEnvironmentNgxMask } from 'ngx-mask';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideHttpClient(withInterceptors([authInterceptor, fuseLoadingInterceptor, mockApiInterceptor])),
        provideEnvironmentNgxMask(),
        provideRouter(appRoutes,
            withPreloading(PreloadAllModules),
            withInMemoryScrolling({scrollPositionRestoration: 'enabled'}),
        ),

        {
            provide : DateAdapter,
            useClass: LuxonDateAdapter,
        },
        {
        provide: MAT_DATE_LOCALE,
        useValue: 'pt-BR'
        },
        {
            provide : MAT_DATE_FORMATS,
            useValue: {

                parse  : {
                    dateInput: 'D',
                },
                display: {
                    dateInput         : 'dd/MM/yyyy',
                    monthYearLabel    : 'LLL yyyy',
                    dateA11yLabel     : 'DD',
                    monthYearA11yLabel: 'LLLL yyyy',
                },
            },
        },

        // Transloco Config
        provideTransloco({
            config: {
                availableLangs      : [
                    {
                        id   : 'en',
                        label: 'English',
                    },
                    {
                        id   : 'pt-br',
                        label: 'Português',
                    },
                ],
                defaultLang         : 'pt-br',
                fallbackLang        : 'pt-br',
                reRenderOnLangChange: true,
                prodMode            : true,
            },
            loader: TranslocoHttpLoader,
        }),
        {
            // Preload the default language before the app starts to prevent empty/jumping content
            provide   : APP_INITIALIZER,
            useFactory: () =>
            {
                const translocoService = inject(TranslocoService);
                const defaultLang = translocoService.getDefaultLang();
                translocoService.setActiveLang(defaultLang);
                console.log('Default lang: ', defaultLang);


                return () => firstValueFrom(translocoService.load(defaultLang));
            },
            multi     : true,
        },

        // Fuse
        provideAuth(),
        provideIcons(),
        provideFuse({
            mockApi: {
                delay   : 0,
                services: mockApiServices,
            },
            fuse   : {
                layout : 'classic',
                scheme : 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme  : 'theme-default',
                themes : [
                    {
                        id  : 'theme-default',
                        name: 'Default',
                    },
                    {
                        id  : 'theme-brand',
                        name: 'Brand',
                    },
                    {
                        id  : 'theme-teal',
                        name: 'Teal',
                    },
                    {
                        id  : 'theme-rose',
                        name: 'Rose',
                    },
                    {
                        id  : 'theme-purple',
                        name: 'Purple',
                    },
                    {
                        id  : 'theme-amber',
                        name: 'Amber',
                    },
                ],
            },
        }),
    ],
};
