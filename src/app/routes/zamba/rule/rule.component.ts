import { Location } from '@angular/common';
import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../services/zamba/shared.service';
import { ZambaService } from '../../../services/zamba/zamba.service';

@Component({
  selector: 'app-rule',
  templateUrl: './rule.component.html',
  styles: [
    `
      #ruleComponentIframe {
        width: 100%;
        height: 100%;
      }

      #main-spinner {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    `
  ]
})
export class RuleComponent implements OnInit {
  WebUrl = environment['apiWebViews'];
  navigateUrl: SafeResourceUrl;
  constructor(
    private location: Location,
    private router: Router,
    private ZambaService: ZambaService,
    private route: ActivatedRoute,
    public sharedService: SharedService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private sanitizer: DomSanitizer
  ) {
    this.navigateUrl = '';
  }

  ngOnInit(): void {
    this.navigateUrl = '';
    this.route.queryParams.subscribe(params => {
      const tokenData = this.tokenService.get();
      let genericRequest = {};
      if (tokenData != null) {
        console.log('Imprimo los valores en tokenService en el service', tokenData);

        genericRequest = {
          UserId: tokenData['userid'],
          Params: params
        };
      }

      this.ZambaService.executeRule(genericRequest).subscribe({
        next: data => {
          switch (params['typeRule']) {
            case 'executeViewTask':
              console.log('Datos recibidos:', data);

              let result = JSON.parse(data);
              let urlTask = result.Vars.scripttoexecute.split("'")[3].replace('..', '');

              let newUrl = `${this.WebUrl}${urlTask}`;
              newUrl = `${newUrl}&t=${tokenData?.token}`;

              //this.navigateUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newUrl);
              // Abre una nueva ventana o pestaña con la URL especificada
              window.open(newUrl, '_blank');
              this.location.back();
              break;
          }
        },
        error: error => {
          console.error('Error al obtener datos:', error);
        }
      });
    });
  }
}
