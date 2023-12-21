import { NgModule } from '@angular/core';
import { DownFileModule } from '@delon/abc/down-file';
import { FullContentModule } from '@delon/abc/full-content';
import { QRModule } from '@delon/abc/qr';
import { G2MiniBarModule } from '@delon/chart/mini-bar';
import { SharedModule } from '@shared';

import { RuleComponent } from './rule/rule.component';
import { ZambaRoutingModule } from './zamba-routing.module';

const COMPONENTS = [RuleComponent];

@NgModule({
  imports: [SharedModule, ZambaRoutingModule, DownFileModule, FullContentModule, QRModule, G2MiniBarModule],
  declarations: COMPONENTS
})
export class ZambaModule { }
