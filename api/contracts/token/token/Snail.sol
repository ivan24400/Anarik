pragma solidity ^0.5.2;

import "./ERC20/ERC20.sol";

contract Snail is ERC20 {

  address private _adminAddr = address(1); // admin's address
  string private _adminName = "light";
  string private _adminPasswd = "dark";

  // List of users who have sent request.
  address[] private _tokenRequestArr;

  struct TokenValue{
    // Internal delete flag
    bool _active;
    // Index in _tokenRequestArr
    uint256 index;
    // Number of tokens
    uint256 value;
    // User Name
    string username;
  }
  // Map of token requests
  mapping( address => TokenValue ) private _tokenRequestMap;

  /**
   * @dev Initialize total supply of tokens and admin's address.
   * @param _totalSupply total number of tokens.
   */
  constructor(uint256 _totalSupply, address _admin_addr)
    ERC20(_totalSupply,_admin_addr)
    public
   {
     _adminAddr = _admin_addr;
   }

  /// Fallback function
  function() external payable {}

  /* Check if token exists for a given user */
  modifier checkTokenRequest(address _user){
    require(_tokenRequestMap[_user]._active,"Token does not exist");
    _;
  }

  /**
   * @dev Creates a token-request. Adds a token request in tokenRequestMap.
   * @param _username user name
   * @param _user token requestor
   * @param _tokenCount Number of tokens required by _username
   * @return operation status
   */
  function addTokenRequest(
    string memory _username,
    address _user,
    uint256 _tokenCount
  )
  public
  returns(bool)
  {
    TokenValue storage tc = _tokenRequestMap[_user];
    tc._active = true;
    tc.value = _tokenCount;
    tc.username = _username;
    tc.index = (_tokenRequestArr.push(_user) - 1);
  }

  /**
   * @dev Get a user's name and requested number of tokens
   * @param _index index in _tokenRequestMap
   * @return username, user account address and token count
   */
    function getTokensDetailsAt(uint256 _index)
      public
      view
      checkTokenRequest(_tokenRequestArr[_index])
      returns(string memory, address, uint256)
    {
      return (
        _tokenRequestMap[_tokenRequestArr[_index]].username,
        _tokenRequestArr[_index],
        _tokenRequestMap[_tokenRequestArr[_index]].value
      );
    }

  /* Get total number of tokens added into the mapping */
  function getTokenRequestCount() public view returns(uint256){
    return _tokenRequestArr.length;
  }

  /* Return admin's account address */
  function getAdminAddress() public view returns(address){
    return _adminAddr;
  }

  /**
   * @dev Check if given credential is a valid admin credential
   * @param _username unverified admin's username
   * @param _password unverifid admin's password
   */
  function verifyAdmin(string memory _username, string memory _password) public view {
    require(
      (keccak256(bytes(_adminName)) == keccak256(bytes(_username))) &&
      (keccak256(bytes(_adminPasswd)) == keccak256(bytes(_password))),
      "Invalid credentials"
    );
  }
  /**
   * @dev Change username and password of admin
   * @param _username admin's username
   * @param _password admin's password
   */
  function updateAdminCreds(string memory _username, string memory _password) public {
    require((bytes(_username).length >= 3) && (bytes(_password).length >= 3),"Invalid credentials");
    _adminName = _username;
    _adminPasswd = _password;
  }

  /**
   * @dev Acknowledge a token request.
   * @param _index index in _tokenRequestArr
   */
  function ackRequestAt(uint256 _index) public checkTokenRequest(_tokenRequestArr[_index]){
    _transfer(_adminAddr,_tokenRequestArr[_index],_tokenRequestMap[_tokenRequestArr[_index]].value);
    _delTokenRequest(_tokenRequestArr[_index]);
  }

  /**
   * @dev Give tokens to a user
   * @param _user token receiver.
   * @param _value number of tokens.
   */
  function donateTokens(address _user, uint256 _value) public{
    _transfer(_adminAddr,_user,_value);
  }

  /* Reject a token request */
  function rejectRequestAt(uint256 _index) public checkTokenRequest(_tokenRequestArr[_index]){
    _delTokenRequest(_tokenRequestArr[_index]);
  }

  /**
   * @dev Send tokens from one user to another
   * @param _from token sender
   * @param _to token receiver
   * @param _value number of tokens to send
   */
  function sendTokens(address _from, address _to, uint256 _value) public {
    require(
      (_from != address(0)) &&
      (_to != address(0)),
      "Invalid address"
    );
    _transfer(_from, _to, _value);
  }

  /* Delete a token of given user*/
  function _delTokenRequest(address _user)
  internal
  checkTokenRequest(_user)
  {
    _tokenRequestArr[_tokenRequestMap[_user].index] = _tokenRequestArr[_tokenRequestArr.length - 1];
    delete _tokenRequestMap[_user];
  }
}
