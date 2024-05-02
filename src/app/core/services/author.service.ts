import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Author } from '../../shared/models/author';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {

  Apiurl = `https://localhost:44385/api/Admin/author`;

  constructor(private http:HttpClient) { }

  getAuthors():Observable<Author>
  {
    return this.http.get<Author>(this.Apiurl);
  }

  addAuthor(body:Author):Observable<Author>{
    return this.http.post<Author>(this.Apiurl,body)
  }

  editAuthor(body:Author,id:number):Observable<Author>{
    return this.http.put<Author>(`${this.Apiurl}/${id}`,body)
  }

  deleteAuthor(id:number):Observable<Author>{
    return this.http.delete<Author>(`${this.Apiurl}/${id}`)
  }
}
