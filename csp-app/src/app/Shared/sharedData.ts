export class SharedData {

    private static _instance: SharedData = new SharedData();
    public slaAvailableList: any[] = [];

    constructor() {
        // if (SharedData._instance) {
        //     throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
        // }
        SharedData._instance = this;
    }

    public static getInstance(): SharedData {
        return SharedData._instance;
    }

}




// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { myUtility } from '../Shared/myUtility';
// import { environment } from '../../environments/environment';
// import { Observable } from 'rxjs/internal/Observable';
// import { HttpHeaders } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root'
// })

// export class SharedData {

//     private static _instance: SharedData = new SharedData();
//     public slaAvailableList: any[] = [];

//     constructor() {
//         if (SharedData._instance) {
//             throw new Error("Error: Instantiation failed: Use SingletonClass.getInstance() instead of new.");
//         }
//         SharedData._instance = this;
//     }

//     public static getInstance(): SharedData {
//         return SharedData._instance;
//     }
// }