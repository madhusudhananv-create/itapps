import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';  
import { myUtility } from '../../Shared/myUtility';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss']
})
export class ActivationComponent implements OnInit {
  message:string;
  email: string;
  code: string;
  private sub: any;
  constructor(private _http: Http, private route: ActivatedRoute, private _util: myUtility) { 
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.email = params['email'];
      this.code = params['code'];
      this.service_Activate(this.email, this.code);
      //this.id = +params['id']; // (+) converts string 'id' to a number
   });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  //**********************************************
  //service methods
  //**********************************************
  dataUpdate: any;
  fdate: any;
  service_Activate(email, code){
    let apiuri: string = environment.webapiuri_auth + 'ActivateUser' + "\?email=" + email + "&code=" + code;   
    this._http.post(apiuri, this.dataUpdate)
    .subscribe
    ( 
      data => {
        this.message = data.text();
      },
      error => {  
        this.message = error.text();
      }
   );   
  }
}
