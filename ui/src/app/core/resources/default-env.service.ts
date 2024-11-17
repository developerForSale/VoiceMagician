import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_PATH } from '../../env';

@Injectable({
  providedIn: 'root',
})
export class DefaultEnvService {

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${API_PATH.RESOURCE_DEFAULT}`);
  }

}
