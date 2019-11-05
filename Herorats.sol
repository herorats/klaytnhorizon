// Klaytn IDE uses solidity 0.4.24, 0.5.6 versions.
pragma solidity >=0.4.24 <=0.5.6;

contract Herorats {
    address owner;
    address payable swap_contract_address = 0xee9AA582D9fD9238037f4CB7571250e5207A6b7b;
    
    event deposit(address, uint256, string, string);
    event withdrawal(address payable, uint256, string, string);

    modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
      owner = msg.sender;
    }
    
    function setOwner(address _owner) public isOwner {
      owner = _owner;
    }
    
    function setSwapContractAddress(address payable _swapContractAddress) public isOwner {
      swap_contract_address = _swapContractAddress;
    }

    // Set value of storage variable `count`.
    function buyBanana(string memory iost_address, string memory job) public payable {
        (bool success, bytes memory data) = address(swap_contract_address)
          .call
          .value(msg.value)
          (
            abi.encodeWithSignature("toIOSTBlockchain(string,string,address,address,uint256)", 
            iost_address, 
            job,
            msg.sender,
            address(0),
            0
          ));
        require(success);
    }
    
    function () external payable {
        
    }
}
