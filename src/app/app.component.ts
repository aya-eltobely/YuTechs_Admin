import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from "./layouts/navbar/navbar.component";
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, NavbarComponent,RouterLink,RouterModule,CommonModule]
})

export class AppComponent implements OnInit {

  constructor(private router:Router) {
    
  }

  ngOnInit(): void {
  }

  isloggview!:any;
  isLoggedView()
  {
   this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
    this.isloggview = (event.url == '/login')  
    })
    return this.isloggview;
  }
}
