pragma solidity ^0.4.0;
contract OperationContract{
    
    address public debtbc;
    
    struct Purchase{
        address from;
        uint amount;
        uint timestamp;
    }
    string name;
    uint128 public status;
    uint amount;
    uint ratePercentage;
    uint purchased;
    uint paid;
    
    Purchase[] public purchases;
    
    
    event Published(address _from, string _name, uint _amount,uint _ratePercentage);
    event Financed(address _from,uint _amount,uint _ratePercentage);
    event Destructed();
    
    
    
    constructor(string _name, uint _amount, uint128 _ratePercentage) public{
        status=1;
        name=_name;
        debtbc = msg.sender;
        amount = _amount;
        ratePercentage = _ratePercentage;
        purchased = 0;
        paid = 0;
        emit Published(msg.sender, name, amount, ratePercentage);
    }
    
    
    function finance() public payable {
        require(msg.value > 0,"Finance more than 0");
        require(msg.value + purchased <= amount,
        "You're trying to finance more than it's needed");
        purchases.push(Purchase({
            from: msg.sender,
            amount: msg.value,
            timestamp: now
        }));
        purchased += msg.value;
        //emit financed
        emit Financed(msg.sender, msg.value, now);
        if(amount <= purchased){
            status=2;
            emit Financed(msg.sender, msg.value, now);
        }
    }
    
    function getNumberOfPurchases() public view returns (uint num){
        num = purchases.length;
    }
    
    function kill() public {
      if(msg.sender == debtbc) {
          selfdestruct(debtbc);
          emit Destructed();
      }
    }
    
    
    /*
    function getUserPurchases(address user,uint number) public view returns (uint amount, uint timestamp){
        require(number < op.purchases[user].length,
        "Invalid number");
        amount = op.purchases[user][number].amount;
        timestamp = op.purchases[user][number].timestamp;
    }
    */
    
}