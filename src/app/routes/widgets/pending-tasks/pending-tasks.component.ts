import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { _HttpClient } from '@delon/theme';
import { GridsterItem } from 'angular-gridster2';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

import { PendingTasksService } from './service/pending-tasks.service';

interface ItemData {
  gender: string;
  name: Name;
  email: string;
}

interface Name {
  title: string;
  first: string;
  last: string;
}

@Component({
  selector: 'pending-tasks',
  templateUrl: './pending-tasks.component.html',
  styleUrls: ['pending-tasks.component.css']
})
export class PendingTasksComponent implements OnInit, OnDestroy {
  @Input()
  widget: GridsterItem = {
    type: '',
    title: '',
    cols: 0,
    rows: 0,
    x: 0,
    y: 0,
    resizeEvent: new EventEmitter<GridsterItem>()
  };
  @Input()
  resizeEvent: EventEmitter<GridsterItem> = new EventEmitter<GridsterItem>();
  divHeight: number = 600;

  loading = false;
  data: any = [];
  private destroy$ = new Subject<boolean>();
  constructor(
    public nzMessage: NzMessageService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private router: Router,
    private pendingTasksService: PendingTasksService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  ngOnInit(): void {
    this.resizeEvent.subscribe((item: any) => {
      this.divHeight = item.itemComponent.height - 60;
      this.cdr.detectChanges();
    });
    const tokenData = this.tokenService.get();
    console.log('Token data:', tokenData);
    if (tokenData != null && tokenData['userid'] != null) {
      var genericRequest = {
        UserId: tokenData['userid'],
        Params: ''
      };
      this.pendingTasksService
        .getMyTasks(genericRequest)
        .pipe(
          catchError(error => {
            console.error('Error en la solicitud:', error);
            return throwError(() => error);
          }),
          finalize(() => {
            this.loading = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe(res => {
          try {
            this.data = res;
          } catch (error) {
            console.log('Resultado de buscar mis tareas:', res);
          }
        });
    }
  }

  OpenTask(url: string): void {
    const tokenData = this.tokenService.get();
    if (tokenData != null && tokenData['token'] != null) {
      try {
        window.open(`${url}&t=${tokenData['token']}`, '_blank');
      } catch (error) {
        console.log('Error al abrir la tarea: ', error);
      }
    }
  }
}
