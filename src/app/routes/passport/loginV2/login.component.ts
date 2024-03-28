import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService, SocialOpenType, SocialService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzTabChangeEvent } from 'ng-zorro-antd/tabs';
import { catchError, finalize, throwError } from 'rxjs';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLoginV2Component implements OnDestroy, OnInit {
  constructor(
    private sanitizer: DomSanitizer,

    private fb: FormBuilder,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private startupSrv: StartupService,
    private http: _HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.safeZambaUrl = '';
  }
  ngOnInit(): void {
    window.addEventListener('message', (event) => {
      if (event.data === 'login-rrhh-ok') {
        console.log('Ha devueto un Ok el sitio web de zamba');
        this.router.navigateByUrl("/");
      } else if (event.data === 'login-rrhh-error') {
        this.authServerError = true;
        this.cdr.detectChanges();
      }
    });
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)]],
    mobile: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
    captcha: ['', [Validators.required]],
    remember: [true]
  });
  error = '';
  serverError = false;
  authServerError = false;
  type = 0;
  loading = false;
  errorUserIsNotActive = false;

  // #region get captcha

  count = 0;
  interval$: any;

  safeZambaUrl: SafeResourceUrl;

  submit(): void {
    this.error = '';
    this.serverError = false;
    this.errorUserIsNotActive = false;
    this.authServerError = false;
    const { email, password } = this.form.controls;
    email.markAsDirty();
    email.updateValueAndValidity();
    password.markAsDirty();
    password.updateValueAndValidity();
    if (email.invalid || password.invalid) {
      return;
    }

    const data = this.form.value;
    const genericRequest = {
      UserId: 0,
      Params: data
    };

    this.loading = true;
    this.cdr.detectChanges();
    this.http
      .post(`${environment['apiRestBasePath']}/login`, genericRequest, null, {
        context: new HttpContext().set(ALLOW_ANONYMOUS, true)
      })
      .pipe(
        catchError(error => {
          console.error('Error en la solicitud:', error);
          this.serverError = true;
          return throwError(() => error);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe(res => {
        res = JSON.parse(res);
        console.log(res);
        if (res.msg == 'Invalid username or password') {
          this.error = res.msg;
          this.cdr.detectChanges();
          return;
        } else if (res.msg == 'ok' && res.isActive == false) {
          this.errorUserIsNotActive = true;
          this.cdr.detectChanges();
          return;
        }
        this.reuseTabService.clear();
        res.user.time = +new Date();
        //res.user.expired = +new Date() + 1000 * 60 * 5;
        res.user.expired = -1;
        this.tokenService.set(res.user);
        this.startupSrv.load().subscribe(() => {
          let url = this.tokenService.referrer!.url || '/';
          if (url.includes('/passport')) {
            url = '/';
          }
          let tokenService = this.tokenService.get();
          console.log(tokenService);
          let userid = tokenService ? tokenService['userid'] : null;
          let token = tokenService ? tokenService['token'] : null;
          this.safeZambaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `${environment['apiWebViews']}/Security/LoginRRHH.aspx?` + `userid=${userid}&token=${token}`
          );
          this.cdr.detectChanges();
          //this.router.navigateByUrl(url);
        });
      });
  }
  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
