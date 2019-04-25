pragma solidity ^0.5.2;

import "./ERC20/ERC20.sol";

contract Snail is ERC20 {

  // List of users who have sent request.
  address[] private _tokenRequestArr;

  struct TokenValue {
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
  constructor(uint256 _totalSupply, address _adminAddr)
    ERC20(_totalSupply, _adminAddr)
    public
   {
    //  _adminAddr = _admin_addr;
   }

  /// Fallback function
  function() external payable {}

  /**
   * @dev Check if token exists for a given user
   * @param _user user account address
   */
  modifier checkTokenRequest(address _user) {
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
    tc.value = _tokenCount;
    tc.username = _username;
    // Overwrite an existing request if it exist
    if(!_tokenRequestMap[_user]._active) {
      tc.index = (_tokenRequestArr.push(_user) - 1);
      tc._active = true;
    }
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

  /**
   * @dev Get total number of tokens added into the mapping
   * @return total elements in tokenRequestArr
   */
  function getTokenRequestCount() public view returns(uint256){
    return _tokenRequestArr.length;
  }

  /**
   * @dev Acknowledge a token request.
   * @param _index index in _tokenRequestArr
   */
  function ackRequestAt(uint256 _index, address _adminAddr) public checkTokenRequest(_tokenRequestArr[_index]){
    _transfer(_adminAddr, _tokenRequestArr[_index], _tokenRequestMap[_tokenRequestArr[_index]].value);
    _delTokenRequest(_tokenRequestArr[_index]);
  }

  /**
   * @dev Give tokens to a user
   * @param _sender token sender
   * @param _receipient token receiver.
   * @param _value number of tokens.
   */
  function donateTokens(address _sender, address _receipient, uint256 _value) public {
    _transfer(_sender, _receipient, _value);
  }

  /**
   * @dev Reject a token request
   * @param _index index of token in token request array
   */
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

  /**
   * @dev Delete a token of given user
   * @param _user user account address
   */
  function _delTokenRequest(address _user)
  internal
  checkTokenRequest(_user)
  {
    if(_tokenRequestMap[_user].index != (_tokenRequestArr.length - 1)) {
      _tokenRequestMap[_tokenRequestArr[_tokenRequestArr.length - 1]].index = _tokenRequestMap[_user].index;
      _tokenRequestArr[_tokenRequestMap[_user].index] = _tokenRequestArr[_tokenRequestArr.length - 1];
    }
    delete _tokenRequestArr[_tokenRequestArr.length - 1];
    _tokenRequestArr.length = _tokenRequestArr.length - 1;
  }
}
