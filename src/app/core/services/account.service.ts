import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

   
  constructor(private http:HttpClient) { }

  login(loginuser:any):Observable<any>
  {
    return this.http.post(`https://localhost:44385/api/Account/login`,loginuser);
  }
  
}
