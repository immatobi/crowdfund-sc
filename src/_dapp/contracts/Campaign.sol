// SPDX-License-Identifier: MIT
pragma solidity >=0.4.12 <0.9.0;

/**

@dev Wrappers over Solidity's arithmetic operations with added overflow checks
*
*
* Arithmetic operations in Solidity wrap on overflow. This can easily result
* in bugs, because programmers usually assume that an overflow raises an
* error, which is the standard behavior in high level programming languages.
* `SafeMath` restores this intuition by reverting the transaction when an
* operation overflows.
*
* Using this library instead of the unchecked operations eliminates an entire
* class of bugs, so it's recommended to use it always.
*/

library SafeMath{

    /**
    @dev returns the addition of two unsigned integers.
    Requirements:
    - Addition cannot overflow
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {

        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
    @dev returns the subtraction of two unsigned integers.
    Requirements:
    - Subtraction cannot overflow
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return _sub(a, b, "SafeMath: subtraction overflow");
    }

    function _sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
    @dev Returns the multiplication of two unsigned integers
    Requirements:
    - Multiplication cannot overflow
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {

        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
    @dev the integer division of two unsigned integers
    Requirements:
    - The divisor cannot be zero
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return _div(a, b, "SafeMath: division by zero");
    }

    function _div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
    @dev the integer division of two unsigned integers
    Requirements:
    - The divisor cannot be zero
    */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return _mod(a, b, "SafeMath: modulo by zero");
    }

    function _mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
    
}

contract Initializable {

    /**
   * @dev Indicates that the contract has been initialized.
   */
  bool private initialized;

  /**
   * @dev Indicates that the contract is in the process of being initialized.
   */
  bool private initializing;

  /**
   * @dev Modifier to use in the initializer function of a contract.
   */
   modifier initializer(){
       require(initializing || initialized, 'Contact instnce has already been initialized');

       bool isTopLevelCall = !initializing;

       if(isTopLevelCall){

           initialized = true;
           initializing = true;

       }

       _;

       if(isTopLevelCall){
           initializing = false;
       }
   }

   /**
    @dev returns true if and only if the function is running in constructor
    */
    function isConstructor() private view returns(bool){

        // returns the current address. Since code is not currently deployed when running a constructor
        address self = address(this); 
        uint cs;

        //Since the code is still not  deployed when running a constructor, any checks on its code size will
        // yield zero, making it an effective way to detect if a contract is under construction or not.
        assembly {  cs := extcodesize(self) }

        return cs == 0 ? true : false;

    }

    // Reserved storage space to allow for layout changes in the future.
    uint256[50] ______gap;

}

/**
@title Campaign
@dev the campaign contract
uses the SafeMath library for uint256 and the initializer contract for constructor
*/
contract Campaign is Initializable {

    using SafeMath for uint256; // use the SafeMath library

    /**
    @dev type definition for campaign requests
    */
    struct Request {
        string description;
        uint amount;
        address payable receiver;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    /**
    @dev type definition for campaign summary
    */
    struct Summary {
        uint256 _minContribution;
        uint256 balance;
        uint256 totalRequest;
        uint256 approversCount;
        address manager;
    }

    address public _manager;
    uint256 public _minContribution;
    uint256 public _requestCount;
    uint256 public _approversCount;
    Summary public _summary;

    Request[] public _requests;
    mapping(address => bool) public _approvers;

    modifier onlyManager() {
        require(msg.sender == _manager, "only manager can access this function");
        _;
    }

    modifier contributionOkay() {
        require(msg.value > _minContribution, "amount must be more than minimum contribution ");
        _;
    }

    modifier hasDonated(){
        require(_approvers[msg.sender], "approver has not donated");
        _;
    }

    /**
    @dev initializes contract (:: acts like constructor ::)
    */
    constructor( address manager, uint256 min){

        require(min != 0, "campaign requires minimum contribution");
        _manager = manager;
        _minContribution = min;

    }


    /**
    @dev contributes (i.e. sends money to ) the campaign
    validated using the contributionOkay() modifier
    */
    function contribute() public payable contributionOkay{
        
        _approvers[payable(msg.sender)] = true;
        _approversCount++;

    }

    /**
    @dev creates a request attached to the campaign
    validated using the onlyManager() modifier
    */
    function createCrequest(string memory desc, uint256 amount, address payable receiver) public onlyManager{

        Request storage newRequest = _requests.push();

        newRequest.description = desc;
        newRequest.amount = amount;
        newRequest.receiver = receiver;
        newRequest.complete = false;
        newRequest.approvalCount = 0;

    }

    /**
    @dev allows approvers (donators) to approve (vote) requests.
    validates to make sure an approver has donated and has not voted
    */
    function approveRequest(uint256 req) public hasDonated{

        Request storage request = _requests[req];
        require(!request.approvals[msg.sender], "approver has already voted");

        request.approvals[msg.sender] = true;
        request.approvalCount++;

    }

    /**
    @dev completes a request and sends money to thr specified receiver
    validated by the onlyManager() modifier
    */
    function completeRequest(uint256 req) public onlyManager{

        Request storage request = _requests[req];
        require(!request.complete, "request is already completed");

        // get the average
        uint256 avg = _approversCount / 2;

        // make sure over 50% of the approvers has voted yes
        require(request.approvalCount > avg, "approval votes must be more than 50%");

        // send money to the receiver and complete request
        request.receiver.transfer(request.amount);
        request.complete = true;


    }

    function getSummary() public returns (Summary memory) {

        _summary._minContribution = _minContribution;
        _summary.balance = address(this).balance;
        _summary.approversCount = _approversCount;
        _summary.totalRequest = _requests.length;
        _summary.manager = _manager;

        return _summary;

    }

    function getRequestsCount() public view returns (uint){
        return _requests.length;
    }


}

/**
@title Factory
@dev the campaign factory contract
used to deploy a new campaign 
*/
contract Factory {

    address[] public campaigns;
    
    event campaignInfo (uint indexed date, address campaign );

    function emitCampaign (address camp) external {
        
    }

    function createCampaign(uint minimum) public {
        
        address newCampaign = address (new Campaign(msg.sender, minimum)); // deploys a new contract to the blockchain
        campaigns.push(newCampaign); // save the new deployed campaign

        emit campaignInfo(block.timestamp, newCampaign); // emit event

    }

    function getCampaigns() public view returns (address[] memory){
        return campaigns;
    }

}
