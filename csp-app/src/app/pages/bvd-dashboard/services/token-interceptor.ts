// import { Injectable } from "@angular/core";
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders } from "@angular/common/http";
// import { Observable } from "rxjs";
// import { myUtility } from "../../../Shared/myUtility";


// @Injectable()
// export class TokenInterceptor implements HttpInterceptor {

//     constructor(private _util: myUtility) { }

//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         const headers = new HttpHeaders({
//             Accept: "application/json",
//             token: this._util.AppSettings.token,
//             empId: localStorage.getItem("empid"),
//         })
//         const modifiedReq = req.clone({
//             headers
//         });
//         return next.handle(modifiedReq);
//     }
// }