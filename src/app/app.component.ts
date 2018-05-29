import { Component,NgZone,Inject} from '@angular/core';
import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

	operations = [];
	title = 'app';
	_web3;
	state:any = {};
	selectedOperation:any = {};
	newOperation:any = {};
	OperationContractAbi;

  	constructor(@Inject(NgZone) private ngZone: NgZone){
		if(typeof window.web3 != 'undefined'){
		      console.log("Using web3 detected from external source like Metamask");
		      console.log(window.web3.currentProvider);
		      //this._web3 = new Web3();
				window.web3.setProvider(window.web3.currentProvider);
				this.OperationContractAbi = window.web3.eth.contract([
						{
							"constant": true,
							"inputs": [],
							"name": "debtbc",
							"outputs": [
								{
									"name": "",
									"type": "address"
								}
							],
							"payable": false,
							"stateMutability": "view",
							"type": "function"
						},
						{
							"constant": true,
							"inputs": [],
							"name": "status",
							"outputs": [
								{
									"name": "",
									"type": "uint128"
								}
							],
							"payable": false,
							"stateMutability": "view",
							"type": "function"
						},
						{
							"constant": false,
							"inputs": [],
							"name": "finance",
							"outputs": [],
							"payable": true,
							"stateMutability": "payable",
							"type": "function"
						},
						{
							"constant": false,
							"inputs": [],
							"name": "kill",
							"outputs": [],
							"payable": false,
							"stateMutability": "nonpayable",
							"type": "function"
						},
						{
							"constant": true,
							"inputs": [
								{
									"name": "",
									"type": "uint256"
								}
							],
							"name": "purchases",
							"outputs": [
								{
									"name": "from",
									"type": "address"
								},
								{
									"name": "amount",
									"type": "uint256"
								},
								{
									"name": "timestamp",
									"type": "uint256"
								}
							],
							"payable": false,
							"stateMutability": "view",
							"type": "function"
						},
						{
							"constant": true,
							"inputs": [],
							"name": "getNumberOfPurchases",
							"outputs": [
								{
									"name": "num",
									"type": "uint256"
								}
							],
							"payable": false,
							"stateMutability": "view",
							"type": "function"
						},
						{
							"inputs": [
								{
									"name": "_name",
									"type": "string"
								},
								{
									"name": "_amount",
									"type": "uint256"
								},
								{
									"name": "_ratePercentage",
									"type": "uint128"
								}
							],
							"payable": false,
							"stateMutability": "nonpayable",
							"type": "constructor"
						},
						{
							"anonymous": false,
							"inputs": [
								{
									"indexed": false,
									"name": "_from",
									"type": "address"
								},
								{
									"indexed": false,
									"name": "_name",
									"type": "string"
								},
								{
									"indexed": false,
									"name": "_amount",
									"type": "uint256"
								},
								{
									"indexed": false,
									"name": "_ratePercentage",
									"type": "uint256"
								}
							],
							"name": "Published",
							"type": "event"
						},
						{
							"anonymous": false,
							"inputs": [
								{
									"indexed": false,
									"name": "_from",
									"type": "address"
								},
								{
									"indexed": false,
									"name": "_amount",
									"type": "uint256"
								},
								{
									"indexed": false,
									"name": "_ratePercentage",
									"type": "uint256"
								}
							],
							"name": "Financed",
							"type": "event"
						},
						{
							"anonymous": false,
							"inputs": [],
							"name": "Destructed",
							"type": "event"
						}
					]
				);
		   		
		   	
	   	}else{
	   		alert("No web3 :(");
	   	//window.web3.setProvider(new window.web3.providers.HttpProvider('http://localhost:8545'));
	      //this._web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
	   	}
  	}

  	ngOnInit(){
  		this.listenToContract("0x357450b81cd5b4b051c86eef351d092440a82326");
  		
  	}

  	listenToContract(address): void{
  		var instance = this.OperationContractAbi.at(address);
  		var event = instance.Published({}, { fromBlock: 0, toBlock: 'latest' }).get((error, eventResult) => {
		  if (error)
		    console.log('Error in myEvent event handler: ' + error);
		  else{
		  	console.log('myEvent: ' + JSON.stringify(eventResult[0]));
		  	if(eventResult[0].event == "Published"){

		  		console.log("Agregando...");
		  		this.ngZone.run(() => { 
			  		this.operations.push({
			  			address: eventResult[0].address,
				  		name:eventResult[0].args.name,
				  		purchased: 0,
						amount: parseInt(eventResult[0].args._amount),
						ratePercentage: parseInt(eventResult[0].args._ratePercentage)
				  	});

			  	});

			  	console.log(this.operations);
		  	}
		  }
		});

		// Or pass a callback to start watching immediately
		var event = instance.Published(function(error, eventResult) {
			console.log("NEW!!!!");
		    if (!error)
		        console.log(eventResult);
		    else{
			  	console.log('myEvent: ' + JSON.stringify(eventResult[0]));
			  	if(eventResult[0].event == "Published"){

			  		console.log("Agregando...");
			  		this.ngZone.run(() => { 
				  		this.operations.push({
				  			address: eventResult[0].address,
					  		name:eventResult[0].args.name,
					  		purchased: 0,
							amount: parseInt(eventResult[0].args._amount),
							ratePercentage: parseInt(eventResult[0].args._ratePercentage)
					  	});
				  	});

				  	console.log(this.operations);
			  	}
			}
		});
  	}

  	createOperation(): void{
  		console.log(this.newOperation);
  		var compiledCode = '608060405234801561001057600080fd5b506040516109353803806109358'+
'33981018060405281019080805182019291906020018051906020019092919080519060200190929'+
'1905050506001600260006101000a8154816fffffffffffffffffffffffffffffffff02191690836'+
'fffffffffffffffffffffffffffffffff160217905550826001908051906020019061009a9291906'+
'10215565b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff02191'+
'6908373ffffffffffffffffffffffffffffffffffffffff16021790555081600381905550806ffff'+
'fffffffffffffffffffffffffffff16600481905550600060058190555060006006819055507f3ca'+
'a197c8e6ea9bc887d82435dddbca1ca41d35d3bbab0a3c1493f8d3e7c50d93360016003546004546'+
'04051808573ffffffffffffffffffffffffffffffffffffffff1673fffffffffffffffffffffffff'+
'fffffffffffffff16815260200180602001848152602001838152602001828103825285818154600'+
'18160011615610100020316600290048152602001915080546001816001161561010002031660029'+
'00480156101fc5780601f106101d1576101008083540402835291602001916101fc565b820191906'+
'000526020600020905b8154815290600101906020018083116101df57829003601f168201915b505'+
'09550505050505060405180910390a15050506102ba565b828054600181600116156101000203166'+
'002900490600052602060002090601f016020900481019282601f1061025657805160ff191683800'+
'1178555610284565b82800160010185558215610284579182015b828111156102835782518255916'+
'02001919060010190610268565b5b5090506102919190610295565b5090565b6102b791905b80821'+
'1156102b357600081600090555060010161029b565b5090565b90565b61066c806102c9600039600'+
'0f300608060405260043610610078576000357c01000000000000000000000000000000000000000'+
'00000000000000000900463ffffffff1680631402b63c1461007d578063200d2ed2146100d457806'+
'3313b7b191461012357806341c0e1b51461012d5780638392fe31146101445780638aee044314610'+
'1bf575b600080fd5b34801561008957600080fd5b506100926101ea565b604051808273fffffffff'+
'fffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815'+
'260200191505060405180910390f35b3480156100e057600080fd5b506100e961020f565b6040518'+
'0826fffffffffffffffffffffffffffffffff166fffffffffffffffffffffffffffffffff1681526'+
'0200191505060405180910390f35b61012b610231565b005b34801561013957600080fd5b5061014'+
'2610549565b005b34801561015057600080fd5b5061016f600480360381019080803590602001909'+
'291905050506105da565b604051808473ffffffffffffffffffffffffffffffffffffffff1673fff'+
'fffffffffffffffffffffffffffffffffffff1681526020018381526020018281526020019350505'+
'05060405180910390f35b3480156101cb57600080fd5b506101d4610633565b60405180828152602'+
'00191505060405180910390f35b6000809054906101000a900473fffffffffffffffffffffffffff'+
'fffffffffffff1681565b600260009054906101000a90046ffffffffffffffffffffffffffffffff'+
'f1681565b6000341115156102a9576040517f08c379a000000000000000000000000000000000000'+
'00000000000000000000081526004018080602001828103825260138152602001807f46696e616e6'+
'365206d6f7265207468616e203000000000000000000000000000815250602001915050604051809'+
'10390fd5b60035460055434011115151561034d576040517f08c379a000000000000000000000000'+
'000000000000000000000000000000000815260040180806020018281038252602e8152602001807'+
'f596f7527726520747279696e6720746f2066696e616e6365206d6f726520746881526020017f616'+
'e2069742773206e65656465640000000000000000000000000000000000008152506040019150506'+
'0405180910390fd5b60076060604051908101604052803373fffffffffffffffffffffffffffffff'+
'fffffffff16815260200134815260200142815250908060018154018082558091505090600182039'+
'0600052602060002090600302016000909192909190915060008201518160000160006101000a815'+
'48173ffffffffffffffffffffffffffffffffffffffff021916908373fffffffffffffffffffffff'+
'fffffffffffffffff160217905550602082015181600101556040820151816002015550505034600'+
'5600082825401925050819055507f0656a111ea078f4c1df099d57729dbeff66b43e23487e357759'+
'19d66b9f0358c333442604051808473ffffffffffffffffffffffffffffffffffffffff1673fffff'+
'fffffffffffffffffffffffffffffffffff168152602001838152602001828152602001935050505'+
'060405180910390a16005546003541115156105475760028060006101000a8154816ffffffffffff'+
'fffffffffffffffffffff02191690836fffffffffffffffffffffffffffffffff1602179055507f0'+
'656a111ea078f4c1df099d57729dbeff66b43e23487e35775919d66b9f0358c33344260405180847'+
'3ffffffffffffffffffffffffffffffffffffffff1673fffffffffffffffffffffffffffffffffff'+
'fffff168152602001838152602001828152602001935050505060405180910390a15b565b6000809'+
'054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673fffffffffffffffff'+
'fffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614156105d'+
'8576000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673fffffff'+
'fffffffffffffffffffffffffffffffff16ff5b565b6007818154811015156105e957fe5b9060005'+
'2602060002090600302016000915090508060000160009054906101000a900473fffffffffffffff'+
'fffffffffffffffffffffffff16908060010154908060020154905083565b6000600780549050905'+
'0905600a165627a7a72305820843b29338e82b737f2238e1a2993d31c53dfb3a170ffb8f273adaaf'+
'0cbedf8bb0029';
  		//this.OperationContractAbi.new();
  		var that = this;
  		var deployedContract = this.OperationContractAbi.new(
  			this.newOperation.name,this.newOperation.amount,this.newOperation.ratePercentage,
  			{data: compiledCode, from: window.web3.eth.accounts[0], gas: 4700000},
  			function(e,contract){
  				if(!e) {
				   if(!contract.address) {
				     console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
				   } else {
				     console.log("Contract mined! Address: " + contract.address);
				     console.log(contract);
				     that.listenToContract(contract.address);
				   }     
				} else{   
					console.log(e);     
				}
  				
  			});
  		console.log(deployedContract);
  		
  	}

  	viewOperation(op): void{
  		console.log("selected")
  		this.selectedOperation = op;
  	}


}


