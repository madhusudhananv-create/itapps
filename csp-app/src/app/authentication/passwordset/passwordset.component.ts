import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';
import { AppsService } from '../../Services/apps.service';

@Component({
  selector: 'app-passwordset',
  templateUrl: './passwordset.component.html',
  styleUrls: ['./passwordset.component.scss']
})
export class PasswordsetComponent implements OnInit {
  private sub: any;  
  email: string;
  password1: string;
  password2: string;
  code: string;
  password_disable:boolean = true;
  constructor(private route: ActivatedRoute, private _router: Router, private _http: Http, private _util: myUtility, private _appservice: AppsService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.email = params['email'];
      this.code = params['code'];
      this.service_VeriftyActivationCode(this.email, this.code);
      //this.id = +params['id']; // (+) converts string 'id' to a number
    });
  }

  SubmitForm(isValid) {
    if (this.password1 != this.password2)
      alert('Both passwords should be same');
    else if (this.password1.length < 8)
      alert('Password should be of 8 characters or more');
    else {
      this.setPassword();
    }
  }

  setPassword() {
    let authdata = { EMAILID: this.email, PASSWORD: this.password1, UPDATED_BY: this.email, UPDATED_DATE: new Date() }
    this._appservice.setPassword(authdata)
      .subscribe
      (
      data => {
        alert("Password updated successfully");
       
        localStorage.setItem('navigateurl', "");
          this._util.empid("");
          this._router.navigateByUrl('/login');
      },
      error => { this._util.serviceError(error); }
      );
  }

  service_VeriftyActivationCode(email, code) {
    let authdata = { EMAILID: email, ACTIVATION_CODE: code }
    this._appservice.VerifyActivationCode(authdata)
      .subscribe(data => {
        this.password_disable = false;
      },
      error => {
        this.password_disable = true;
        this._util.serviceError(error);
      }
      );
  }
}
