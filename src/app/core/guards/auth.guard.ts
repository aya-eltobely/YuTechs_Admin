import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  let router = inject(Router);

// return true;
  if( localStorage.getItem('token') )
  {
    return true;
  }
  else
  {
    router.navigate(['/login'])
    return false;
  }
  

};
