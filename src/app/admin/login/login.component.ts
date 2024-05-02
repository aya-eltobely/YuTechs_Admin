import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent  implements OnInit {

  loginForm!:FormGroup;

  constructor(private FB:FormBuilder, private accService:AccountService,private router:Router,private tostr:ToastrService) {
    
  }


  ngOnInit(): void {
    this.intializeLoginForm();
  }

  intializeLoginForm()
  {
    this.loginForm = this.FB.group(
      {
        UserName: [null , [Validators.required]],
        Password : [null , [Validators.required] ]
      }
    )
  }


  submitForm()
  {
    if(this.loginForm.invalid)
    {
      this.loginForm.markAllAsTouched();
    }
    else
    {      
      this.accService.login(this.loginForm.value).subscribe( (res:any) => 
      {
        const decodedToken = jwtDecode(res.token) as { [key: string]: string | number };

        const role = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

        if(role == "Admin")
        {
          localStorage.setItem('token',res.token);
          this.loginForm.reset();
          this.router.navigate(['/'])
        }
        else
        {
          this.tostr.error("Unauthorized");
        }
        
      });
      

    }

  }


}
