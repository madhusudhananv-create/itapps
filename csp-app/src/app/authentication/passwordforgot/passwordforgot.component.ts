import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { myUtility } from '../../Shared/myUtility';
import { AppsService } from '../../Services/apps.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-passwordforgot',
  templateUrl: './passwordforgot.component.html',
  styleUrls: ['./passwordforgot.component.scss']
})
export class PasswordforgotComponent implements OnInit {
  password: string;
  companyName = environment.company_name;
  constructor(private _http: Http, private _util: myUtility, private _appservice: AppsService, private _router: Router) { }

  ngOnInit() {
  }
  SubmitForm(isValid) {
    if (!isValid || this.password.trim() == '') {
      alert("Please enter the email id");
    }
    else if (this.password.toLocaleLowerCase().search('@gavstech') != -1)
      alert(`${this.companyName}, please re-set your password in google account and use the same credentials here to login`);
    else {
      this._appservice.forgotPassword(this.password).subscribe(data => {
        alert("Please check your e-mail for password reset link");
        this._router.navigateByUrl('/login');
      }, error => {
        this._util.serviceError(error);
      });

    }
  }

}
