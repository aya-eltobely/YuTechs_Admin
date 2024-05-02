import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { NgbAlertModule, NgbDropdown, NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterLink,NgbAlertModule,NgbDropdownModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
 

  islogged:boolean=false;
  adminName!:any;


  constructor(private router:Router) {
    
  }

  ngOnInit(): void {
    if(localStorage.getItem('token'))
    {
      this.islogged=true;
      const token:any  = localStorage.getItem('token');
      const decodedToken = jwtDecode( token ) as { [key: string]: string | number };
      this.adminName = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    }
    else
    {
      this.islogged=false
    }
  }

 

  onlogout()
  {
    localStorage.removeItem('token')
    this.router.navigate(['/login'])

  }


}
