// Klaytn IDE uses solidity 0.4.24, 0.5.6 versions.
pragma solidity >=0.4.24 <=0.5.6;

contract Swap {
    address owner;
    
    event deposit(address, uint256, string, string, address);

    modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    // iost tx hash => bool
    mapping (string => bool) public txHashMap;

    constructor() public {
      owner = msg.sender;
    }
    
    function setOwner(address _owner) public isOwner {
      owner = _owner;
    }
    
    // approve should be called before.
    function transferKCT(address kctContractAddress, address to, uint256 amount) public {
      (bool success, bytes memory data1) = address(kctContractAddress)
        .call(abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, to, amount));
      
      require(success);
    }
    
    function toIOSTBlockchain(
      string memory iost_address, 
      string memory job,
      address refund_address,
      address kct_contract_address,
      uint256 amount
    ) public payable {
      
      // KCT
      if (kct_contract_address != address (0)) {
        require(amount > 0);
        transferKCT(kct_contract_address, address(this), amount);
        emit deposit(refund_address, amount, iost_address, job, kct_contract_address);
      } else {
        require(msg.value > 0);
        emit deposit(refund_address, msg.value, iost_address, job, kct_contract_address);
      }
    }
    
    function fromIOSTBlockchain(
      address payable klayAddress, 
      uint256 amount, 
      string memory iost_tx_hash, 
      address kct_contract_address
    ) public isOwner {
      require(txHashMap[iost_tx_hash] == false);
      
      if (kct_contract_address != address (0)) {
        transferKCT(kct_contract_address, klayAddress, amount);
      } else {
        address(klayAddress).transfer(amount);
      }
      
      txHashMap[iost_tx_hash] = true;
    }
}
