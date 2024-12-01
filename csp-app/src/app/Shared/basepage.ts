import { OnInit } from "@angular/core";
import { myUtility } from "./myUtility";
import { Router } from "@angular/router";

export class basepage implements OnInit {
    private _privaterouter: Router;
    ngOnInit() {
        this.validateLogin();
    }
    validateLogin() {
        let empid = localStorage.getItem('empid');
        let token = localStorage.getItem('token');
        if (empid === "" || empid === null || token === "" || token === null) {
            alert("Please login to continue");
            this._privaterouter.navigateByUrl('/login');
        }
    }
}