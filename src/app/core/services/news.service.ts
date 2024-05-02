import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { News } from '../../shared/models/news';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  Apiurl = `https://localhost:44385/api/Admin/news`;

  constructor(private http:HttpClient) { }

  getNews():Observable<News>
  {
    return this.http.get<News>(this.Apiurl);
  }

  addNews(body:News):Observable<News>{
    return this.http.post<News>(this.Apiurl,body)
  }

  editNews(body:News,id:number):Observable<News>{
    return this.http.put<News>(`${this.Apiurl}/${id}`,body)
  }

  deleteNews(id:number):Observable<News>{
    return this.http.delete<News>(`${this.Apiurl}/${id}`)
  }
}
