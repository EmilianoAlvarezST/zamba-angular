import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { CallbackComponent } from './callback.component';
import { UserLockComponent } from './lock/lock.component';
import { UserLoginV2Component } from './loginV2/login.component';
import { PassportRoutingModule } from './passport-routing.module';
import { UserRegisterComponent } from './register/register.component';
import { UserRegisterResultComponent } from './register-result/register-result.component';

import { RecaptchaModule } from 'ng-recaptcha';
import { ValidateComponent } from "./validate.component";
import { ResendVerificationEmailComponent } from './resend-verification-email/resend-verificationemail.component';
import { ResendResultComponent } from './resend-result/resend-result.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ResetResultComponent } from './reset-result/reset-result.component';
import { ChangePasswordExpiredComponent } from './change-password-expired/change-password-expired';
import { ChangePasswordResultComponent } from './change-password-result/change-password-result.component';

import { InitialPasswordWizardComponent } from "../welcome/initial-password-wizard/initial-password-wizard.component";

const COMPONENTS = [UserLoginV2Component, UserRegisterResultComponent, UserRegisterComponent, UserLockComponent, CallbackComponent, ValidateComponent, ResendVerificationEmailComponent, ResendResultComponent, ResetPasswordComponent, ChangePasswordComponent, ResetResultComponent, ChangePasswordExpiredComponent, ChangePasswordResultComponent, InitialPasswordWizardComponent];

@NgModule({
  imports: [SharedModule, PassportRoutingModule, RecaptchaModule],
  declarations: [...COMPONENTS]
})
export class PassportModule { }
