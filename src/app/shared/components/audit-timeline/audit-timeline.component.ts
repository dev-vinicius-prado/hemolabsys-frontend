import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface AuditChange {
    property: string;
    oldValue: any;
    newValue: any;
    changeType: string;
}

export interface AuditLog {
    author: string;
    commitDate: string;
    commitId: string;
    changes: AuditChange[];
}

@Component({
    selector       : 'app-audit-timeline',
    templateUrl    : './audit-timeline.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [CommonModule, MatIconModule],
})
export class AuditTimelineComponent
{
    @Input() logs: AuditLog[] = [];

    /**
     * Constructor
     */
    constructor()
    {
    }

    formatValue(value: any): string {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
        return value.toString();
    }
}
