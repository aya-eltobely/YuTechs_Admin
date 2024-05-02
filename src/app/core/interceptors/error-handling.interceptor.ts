import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, retry, throwError } from 'rxjs';

export const errorHandlingInterceptor: HttpInterceptorFn = (req, next) => {

  
  const toastr = inject(ToastrService) // this instead of constructure and injection 


  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status == 401) {
        toastr.error('Unauthrized', 'error');
      }
      if (error.status == 404) {
        toastr.error('Not Found', 'error')
      }

      if (error.status == 408) {
        retry(2)
        toastr.error('Network error', 'error')
      }

      if (error.status == 500) {
        toastr.error('Internal Serval Error', 'error')
      }

      if (error.status == 405) {
        toastr.error('Unauthorized', error.message);
        
      }

      if (error.status == 400) {
        
        // if(typeof(error.error) != 'string')
        // {
        //   error.error.forEach( (e:any) => {
        //     toastr.error(e.description)       
        //   });
        // }
        if(typeof(error.error) != 'string')
        {
          for(let i in error.error.errors)
          {
            toastr.error(error.error.errors[i])
          }
        }
        else
        {
         toastr.error(error.error)       
        }
      }

      return throwError(() => error)
    })
  );


};
