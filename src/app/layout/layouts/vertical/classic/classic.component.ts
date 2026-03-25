import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseNavigationService, FuseVerticalNavigationComponent, FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'classic-layout',
    templateUrl  : './classic.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [FuseLoadingBarComponent, FuseVerticalNavigationComponent, MatButtonModule, MatIconModule, LanguagesComponent, FuseFullscreenComponent, SearchComponent, ShortcutsComponent, MessagesComponent, NotificationsComponent, UserComponent, NgIf, RouterOutlet, QuickChatComponent],
})
export class ClassicLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to navigation data and user data
        combineLatest([
            this._navigationService.navigation$,
            this._userService.user$
        ])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(([navigation, user]) =>
            {
                // Clone the navigation data
                const clonedNavigation = JSON.parse(JSON.stringify(navigation));

                // Filter the navigation items based on the user's role
                this.navigation = {
                    ...clonedNavigation,
                    default: this._filterNavigation(clonedNavigation.default, user)
                };
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Filter navigation items based on the user's role
     *
     * @param navigation
     * @param user
     * @private
     */
    private _filterNavigation(navigation: FuseNavigationItem[], user: User): FuseNavigationItem[]
    {
        return navigation.filter((item) => {
            // If the item has a 'meta.roles' property...
            if ( item.meta && item.meta.roles )
            {
                // Check if the user's role is included in the roles array
                const hasRole = item.meta.roles.includes(user.role);

                // If the user doesn't have the role, don't show the item
                if ( !hasRole )
                {
                    return false;
                }
            }

            // If the item has children, filter them as well
            if ( item.children )
            {
                item.children = this._filterNavigation(item.children, user);

                // If the item is collapsable and has no children left after filtering, don't show the item
                if ( item.type === 'collapsable' && item.children.length === 0 )
                {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
