import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { ALLOW_ANONYMOUS } from '@delon/auth';
import { environment } from '@env/environment';
import { _HttpClient } from '@delon/theme';

@Injectable({
  providedIn: 'root'
})
export class PendingTasksService {

  constructor(private http: _HttpClient) { }

  getMyTasks(genericRequest: any) {
    return this.http.post(`${environment['apiRestBasePath']}/getMyTasks`, genericRequest, null, {
      context: new HttpContext().set(ALLOW_ANONYMOUS, true)
    })
  }
}
