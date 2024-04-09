import { Component, EventEmitter, Inject, Input, OnInit } from '@angular/core';
import { PendingVacationsService } from "./service/pending-vacations.service";
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Subscription, catchError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { Vacation } from './entitie/vacation';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { GridsterItem } from 'angular-gridster2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pending-vacations',
  templateUrl: './pending-vacations.component.html',
  styleUrls: ['./pending-vacations.component.less']
})
export class PendingVacationsComponent implements OnInit {
  vacations: Vacation[] = [];
  TotalDays: number = 0;
  size: NzButtonSize = 'large';
  info: boolean = true;

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

  @Input()
  changeEvent: EventEmitter<GridsterItem> = new EventEmitter<GridsterItem>();

  private resizeSubscription: Subscription | undefined;
  private changeSubscription: Subscription | undefined;

  constructor(@Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService, private cdr: ChangeDetectorRef,
    private PVService: PendingVacationsService, private router: Router,) { }

  ngOnInit(): void {
    this.GetExternalsearchInfo();
    this.GetVacation();

    this.resizeSubscription = this.resizeEvent.subscribe((event: any) => {
      // console.log("🔴: " + event);
      if (this.widget['name'] == event.item['name']) {
        this.changeEvent.emit(event);
        this.cdr.detectChanges();
      }
    });
    this.changeSubscription = this.changeEvent.subscribe((item: any) => {
      // console.log("🟢: " + item);
    });
  }

  private GetVacation() {
    const tokenData = this.tokenService.get();
    let genericRequest = {};

    if (tokenData != null) {
      genericRequest = {
        UserId: tokenData['userid'],
        Params: ''
      };

      this.PVService._GetVacation(genericRequest).pipe(
        catchError(error => {
          console.error('Error al obtener datos:', error);
          throw error; // Puedes relanzar el error o retornar un valor por defecto
        })
      )
        .subscribe(data => {
        });
    }
  }

  GetExternalsearchInfo() {
    const tokenData = this.tokenService.get();
    let genericRequest = {};

    if (tokenData != null) {
      genericRequest = {
        UserId: tokenData['userid'],
        Params: {
          EntityID: '258',
          DoctypesId: '110'
        }
      };

      this.PVService._GetExternalsearchInfo(genericRequest).pipe(
        catchError(error => {
          console.error('Error al obtener datos:', error);
          throw error;
        })
      )
        .subscribe(data => {
          var JsonData = JSON.parse(data);

          if (this.vacations != null) {
            for (let item of JsonData) {

              var vacationItem: Vacation = new Vacation();

              vacationItem.AuthorizeOption = item["AuthorizeOption"];
              vacationItem.RequestedDaysOption = item["RequestedDaysOption"];
              vacationItem.VacationFromOption = item["VacationFromOption"];
              vacationItem.VacationToOption = item["VacationToOption"];

              this.TotalDays = item["TotalDays"].toString();
              this.vacations.push(vacationItem);

            }
          }

          this.cdr.detectChanges();

        });
    }
  }

  RequestVacation() {
    var route = "/zamba/rule";
    this.router.navigate([route], { queryParams: { typeRule: 'executeViewTask', ruleId: "133" } });
  }
}

