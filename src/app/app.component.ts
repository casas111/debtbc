import { Component,NgZone,Inject} from '@angular/core';
import * as Web3 from 'web3';
import { ContractLoaderService } from './services/contract-loader.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';

declare let require: any;
declare let window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	operations = [];
	pendindOperations = [];
	title = 'app';
	_web3;
	state:any = {};
	selectedOperation:any = {};
	newOperation:any = {};
	contract:any = {};
	dbRef;

  	constructor(@Inject(NgZone) private ngZone: NgZone,
  		private contractLoaderService:ContractLoaderService,
  		private db: AngularFireDatabase){
  		this.dbRef = db.list('/operations');
  	}

  	ngOnInit(){
  		if(typeof window.web3 != 'undefined'){
	    	console.log("Using web3 detected from external source like Metamask");
			window.web3.setProvider(window.web3.currentProvider);
			this.contractLoaderService.getOperationAbi().subscribe(abi => {
				this.contract.abi = abi;
				this.contract.class = window.web3.eth.contract(this.contract.abi);
				//I chain it with the request for bytecode
				this.contractLoaderService.getOperationBytecode().subscribe(comp => {
					this.contract.compiled = comp;
					//we listen to the old contracts
					//first I retrieve the firebase contract addresses
		  			this.dbRef.valueChanges(['child_added']).subscribe(firebaseOps => {
		  				console.log("Firebase CB");
						console.log(firebaseOps);
						this.operations = [];
						firebaseOps.forEach(fop => {
							this.listenToContract(fop);
						});
					});
				});
			});
				
	   	}else{
	   		alert("No web3 :(");
	   	}
  	}

  	listenToContract(address): void{
  		var instance = this.contract.class.at(address);

  		//new contract event
  		instance.Published({}, { fromBlock: 0, toBlock: 'latest' }).get((error, eventResult) => {
		  console.log("OLD PUBLISHED");
		  console.log(eventResult);
		  if (error)
		    console.error(error);
		  else{
		  	console.log('event: ' + JSON.stringify(eventResult[0]));
	  		this.ngZone.run(() => { 
		  		this.operations.push({
		  			address: eventResult[0].address,
			  		name:eventResult[0].args._name,
			  		purchased: 0,
			  		purchases: [],
					amount: parseInt(eventResult[0].args._amount),
					ratePercentage: parseInt(eventResult[0].args._ratePercentage)
			  	});
			  	this.listenToOtherEvents(instance);
		  	});
		  }
		});
  	}

  	private listenToOtherEvents(instance){
		//finance event
		var event = instance.Financed({}, { fromBlock: 0, toBlock: 'latest' }).get((error, financeArr) => {
			console.log("NEW FINANCED!!!!");
		    if (error)
		        console.error(error);
		    else{
		  		this.ngZone.run(() => { 
		  			financeArr.forEach(finance => {
		  				this.processFinanceEvent(finance);
		  			});
			  	});
			}
		});
		instance.Financed().watch((error,financed) => {
			console.log("LLEGO en WATCH!");
			if (error)
		        console.error(error);
		    else{
		  		this.ngZone.run(() => { 
		  			this.processFinanceEvent(financed);
			  	});
			}
		});
  	}

  	private processFinanceEvent(finance){
		this.operations.forEach(op => {
	  		if(op.address == finance.address){
	  			op.purchased += parseInt(finance.args._amount);
	  			op.purchases.push({
	  				from: finance.args._from,
	  				amount: parseInt(finance.args._amount),
	  				timestamp: new Date(finance.args._timestamp)
	  			});
	  		}
	  	});
  	}

  	createOperation(): void{
  		console.log(this.newOperation);
  		this.contract.class.new(
  			this.newOperation.name,this.newOperation.amount,this.newOperation.ratePercentage,
  			{data: this.contract.compiled, from: window.web3.eth.accounts[0], gas: 9900000},
  			(e,contract) => {
  				if(!e) {
				   	if(!contract.address) {
					    console.log(contract.transactionHash+" waiting to be mined...");
					    console.log(contract);
					    this.pendindOperations.push({hash:contract.transactionHash,name:this.newOperation.name});
				   	} else {
				    	console.log("Contract mined! Address: " + contract.address);
				    	console.log(this.pendindOperations);
				    	this.pendindOperations = this.pendindOperations.filter(item => item.hash !== contract.transactionHash);
				    	this.dbRef.push(contract.address);
				   	}     
				} else{   
					console.log(e);     
				}
  				
  			}
  		);
  	}

  	viewOperation(op): void{
  		console.log("selected")
  		this.selectedOperation = op;
  	}


}


