pragma solidity ^0.5.2;

import "./UserIntf.sol";

/**
 * @author Ivan Pillay
 * @title Stores user data and related functions
 */
contract User is UserIntf {

  struct UserData {
    // internal delete flag
    bool _active;
    // admin access control
    bool isAdmin;
    // index in userArr
    uint256 index;
    // user account address
    address account;
    // username
    bytes32 user;
    // password
    string passwd;
    // log entries
    string[] log;
  }

  // Map of username to User struct
  mapping( bytes32 => UserData ) public userMap;
  // Map of user account address to username
  mapping( address => bytes32 ) public addrUserMap;
  // Array of username
  bytes32[] public userArr;

  // Initialize a admin user
  constructor (
    bytes32 _adminName,
    string memory _adminPasswd,
    address _account
  ) public {
    // Add an admin user
    UserData storage userData = userMap[_adminName];
    userData._active = true;
    userData.account = _account;
    userData.isAdmin = true;
    userData.user = _adminName;
    userData.passwd = _adminPasswd;
    userData.index = (userArr.push(_adminName) - 1);
    addrUserMap[_account] = _adminName;
    emit UserEvent(msg.sender, _adminName, "created");
  }

  /**
   * @dev Check if user credentials are valid
   * @param _username username value of user credential
   * @param _password password value of user credential
   * @return A boolean indicating credential's validity
   */
  function verifyCredential(bytes32 _username, string memory _password) public view returns(bool) {
    require(
      (userMap[_username]._active == true) &&
      (keccak256(abi.encodePacked(userMap[_username].user)) == keccak256(abi.encodePacked(_username))) &&
      (keccak256(bytes(userMap[_username].passwd)) == keccak256(bytes(_password))),
      "Invalid credentials"
    );
    return true;
  }

  /**
   * @dev Check if admin credentials are valid
   * @param _username username value of admin credential
   * @param _password password value of admin credential
   * @return A boolean indicating credential's validity
   */
  function verifyAdminCredential(bytes32 _username, string memory _password) public view returns(bool) {
    require(
      (userMap[_username]._active) &&
      (userMap[_username].isAdmin) &&
      (keccak256(abi.encodePacked(userMap[_username].user)) == keccak256(abi.encodePacked(_username))) &&
      (keccak256(bytes(userMap[_username].passwd)) == keccak256(bytes(_password))),
      "Invalid credentials"
    );
    return true;
  }

  /**
   * @dev Check if user exist
   * @param _username username value of user's credential
   * @return A boolean indicating if user exist
   */
   function isUserExist(bytes32 _username) public view returns(bool) {
     require(userMap[_username]._active, "User does not exist");
     return true;
   }

   /**
    * @dev Check if user is admin
    * @param _username username value of user's credential
    * @return A boolean indicating if user exist
    */
    function isUserAdmin(bytes32 _username) public view returns(bool) {
      require(
        (userMap[_username].isAdmin) &&
        (userMap[_username]._active),
        "User is not admin"
      );
      return true;
    }

  /**
   * @dev Adds a new user to the application
   * @param _username Username
   * @param _account user account address
   * @param _password user account password
   */
  function addUser (
    bytes32 _username,
    address _account,
    string memory _password
  ) public {
    require(!userMap[_username]._active, "Username already taken");

    UserData storage userData = userMap[_username];
    userData._active = true;
    userData.account = _account;
    userData.user = _username;
    userData.passwd = _password;
    userData.index = (userArr.push(_username) - 1);
    addrUserMap[_account] = _username;

    emit UserEvent(msg.sender, _username, "added");
  }

  /**
   * @dev Updates user's password
   * @param _username username value of user credential
   * @param _oldPasswd user's existing password
   * @param _newPasswd user's new password
   */
   function updatePasswd (
     bytes32 _username,
     string memory _oldPasswd,
     string memory _newPasswd
   ) public {
     require(verifyCredential(_username, _oldPasswd));

     UserData storage userData = userMap[_username];
     userData.passwd = _newPasswd;

     emit UserEvent(msg.sender, _username, "updated");
   }

  /**
   * @dev Delete a user
   * @param _username username of User which is to be deleted
   * @param _password password of the User which is to be deleted.
   * @return operation status
   */
  function removeUser (
    bytes32 _username,
    string memory _password
  ) public {
    require(verifyCredential(_username, _password));

    uint256 index = userMap[_username].index;

    if(index != (userArr.length - 1)){
      userArr[index] = userArr[userArr.length - 1];
      delete userArr[userArr.length - 1];
    }
    userArr.length = userArr.length - 1;
    delete userMap[_username];

    emit UserEvent(msg.sender, _username, "removed");
  }

  /**
   * @dev Get user's account address
   * @param _username User's username as used in credential.
   * @return account(token's wallet) address
   */
  function getUserAccAddr(bytes32 _username) public view returns(address) {
    require(
      userMap[_username]._active &&
      ! userMap[_username].isAdmin,
      "Invalid user"
    );
    return (userMap[_username].account);
  }

  /**
   * @dev Get admin's account address
   * @param _username User's username as used in credential
   * @return account(token's wallet) address
   */
  function getAdminAccAddr(bytes32 _username, string memory _password) public view returns(address) {
    require(verifyAdminCredential(_username, _password));
    return (userMap[_username].account);
  }

  /**
   * @return total number of elements in userArr
   */
  function getUserCount() public view returns(uint256) {
    return userArr.length;
  }

  /**
   * @dev Retrieve username stored at an index
   * @param _index index in userArr
   * @return username
   */
  function getUserNameAt(uint256 _index) public view returns(bytes32){
    require(
      (_index < userArr.length) &&
      (_index >= 0) &&
      (userMap[userArr[_index]].isAdmin) &&
      (userMap[userArr[_index]]._active == true),
      "Invalid index"
    );
    return userArr[_index];
  }

  /**
   * @dev Return username of the account holder
   * @param _addr user account address
   * @return username
   */
  function getUserNameFromAcc(address _addr) public view returns(bytes32) {
    return addrUserMap[_addr];
  }

  /**
   * @dev Add information to user's log
   * @param _username User whose log is to be updated.
   * @param _info Information to be added to the log.
   * @return operation status
   */
  function addLog(bytes32 _username, string memory _info) public {
    UserData storage data = userMap[_username];
    data.log.push(_info);
  }

  /**
   * @dev Return user log
   * @param _username username value of user's credential
   * @param _index index of the log
   * @return A log entry
   */
  function getLog(bytes32 _username, uint256 _index) public view returns (string memory){
    return userMap[_username].log[_index];
  }

  /**
   * @dev Get total log entries of a user
   * @param _username username value of user's credential
   * @return total number of log entries
   */
  function getLogCount(bytes32 _username) public view returns(uint256){
    return userMap[_username].log.length;
  }
}
