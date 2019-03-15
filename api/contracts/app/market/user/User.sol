pragma solidity ^0.5.2;

import "./UserIntf.sol";

contract User is UserIntf {

  struct UserData {
    //internal delete flag
    bool _active;
    //index in userArr
    uint256 index;
    //user account address
    address account;
    // username
    string user;
    // password
    string passwd;
    // log entries
    string[] log;
  }

  // Map of username to User struct
  mapping( string => UserData ) internal userMap;
  // Map of user account address to username
  mapping( address => string ) internal addrUserMap;
  // Array of username
  string[] userArr;

  /* Check if user credentials are valid or not */
  function verifyCredential(string memory _username, string memory _password) public view returns(bool) {
    require(
      (userMap[_username]._active == true) &&
      (keccak256(bytes(userMap[_username].user)) == keccak256(bytes(_username))) &&
      (keccak256(bytes(userMap[_username].passwd)) == keccak256(bytes(_password))),
      "Invalid credentials"
    );
    return true;
  }

  /**
   * @dev Adds a new user to the application
   * @param _username Username
   * @param _account user account address
   * @param _password user account password
   */
  function addUser(string memory _username, address _account, string memory _password) public {
    require(userMap[_username]._active == false,"Username already exists !");

    UserData storage userData = userMap[_username];
    userData._active = true;
    userData.account = _account;
    userData.user = _username;
    userData.passwd = _password;
    userData.index = (userArr.push(_username) - 1);
    addrUserMap[_account] = _username;

    emit UserEvent(address(this),"User logged in !");
  }

  /**
   * @dev Get user's account address
   * @param _username User's username as used in credential.
   * @return account(token's wallet) address
   */
  function getUserAccAddr(string memory _username) public view returns(address) {
    return (userMap[_username].account);
  }

  /* Get total number of elements in userArr (Not necessarily total number of users !) */
  function getUserCount() public view returns(uint256) {
    return userArr.length;
  }

  /* Return username stored at an index */
  function getUserNameAt(uint256 _index) public view returns(string memory){
    require(
      (_index < userArr.length) &&
      (_index >= 0) &&
      (userMap[userArr[_index]]._active == true),
      "Invalid index"
    );
    return userArr[_index];
  }

  /* Return username of the account holder */
  function getUserNameFromAcc(address _addr) public view returns(string memory){
    return addrUserMap[_addr];
  }

  /**
   * @dev Return given user's password.
   * @param _username User name
   * @return _username's password
   */
  function getUserPassword(string memory _username) public view returns (string memory){
    return userMap[_username].passwd;
  }

  /**
   * @dev Delete a user
   * @param _username username of User which is to be deleted
   * @param _password password of the User which is to be deleted.
   * @return operation status
   */
  function removeUser(string memory _username, string memory _password) public {
    require(verifyCredential(_username, _password));

    uint256 index = userMap[_username].index;
    if(index != (userArr.length - 1)){
      userArr[index] = userArr[userArr.length - 1];
      delete userArr[userArr.length - 1];
    }
    delete userMap[_username];

    emit UserEvent(address(this),"User removed !");
  }

  /**
   * @dev Add information to user's log
   * @param _username User whose log is to be updated.
   * @param _info Information to be added to the log.
   * @return operation status
   */
  function addLog(string memory _username, string memory _info) public {
    UserData storage data = userMap[_username];
    data.log.push(_info);
  }

  /* Return user log */
  function getLog(string memory _username, uint256 _index) public view returns (string memory){
    return userMap[_username].log[_index];
  }

  /* Get total log entries of a user */
  function getLogCount(string memory _username) public view returns(uint256){
    return userMap[_username].log.length;
  }
}
