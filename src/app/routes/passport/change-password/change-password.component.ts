import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { ALLOW_ANONYMOUS, DA_SERVICE_TOKEN, ITokenService, SocialOpenType, SocialService } from '@delon/auth';
import { SettingsService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzTabChangeEvent } from 'ng-zorro-antd/tabs';
import { catchError, finalize, throwError } from 'rxjs';

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.less'],
  providers: [SocialService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent implements OnDestroy, OnInit {
  token = '';
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
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
  ) { }
  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';

    console.log("token: ", this.token);
    const genericRequest = {
      UserId: 0,
      Params: { tokendata: this.token }
    };
    this.http
      .post(
        `${environment['apiRestBasePath']}/ValidateResetToken`,
        genericRequest,
        null,
        {
          context: new HttpContext().set(ALLOW_ANONYMOUS, true)
        }
      )
      .pipe(
        catchError((error) => {
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
        if (res != 'ok') {
          this.router.navigateByUrl('/passport/changepasswordexpired');
          return;
        }
      });
  }
  form = this.fb.group({
    password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)]],
    repassword: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)]],
  }, { validator: this.passwordMatchValidator });
  error = '';
  serverError = false;
  type = 0;
  loading = false;
  errorUserIsNotActive = false

  passwordMatchValidator(g: FormGroup) {
    let password = g.get('password')?.value;
    let repassword = g.get('repassword')?.value;
    return password === repassword
      ? null : { 'mismatch': true };
  }
  // #region get captcha

  count = 0;
  interval$: any;
  passwordVisible = false;



  submit(): void {
    this.error = '';
    this.serverError = false;
    this.errorUserIsNotActive = false;
    const { repassword, password } = this.form.controls;
    password.markAsDirty();
    password.updateValueAndValidity();
    repassword.markAsDirty();
    repassword.updateValueAndValidity();

    const data = this.form.value;

    console.log(data);
    const genericRequest = {
      UserId: 0,
      Params: {
        tokendata: this.token,
        newpassword: data.password
      }
    };

    this.loading = true;
    this.cdr.detectChanges();
    this.http
      .post(
        `${environment['apiRestBasePath']}/ResetPassword`,
        genericRequest,
        null,
        {
          context: new HttpContext().set(ALLOW_ANONYMOUS, true)
        }
      )
      .pipe(
        catchError((error) => {
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
        this.cdr.detectChanges();
        this.router.navigateByUrl('/passport/changepasswordresult?rv=' + res);
      });
  }
  ngOnDestroy(): void {
    if (this.interval$) {
      clearInterval(this.interval$);
    }
  }
}
