import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContractLoaderService {

  constructor(private http:HttpClient) { }

  getOperationAbi(){
  	return this.http.get("assets/contracts/Operation.abi");
  }

  getOperationBytecode(){
  	return this.http.get("assets/contracts/Operation.bytecode",{responseType:'text'});
  }
}
