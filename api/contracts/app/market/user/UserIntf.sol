pragma solidity ^0.5.6;

/**
 * @author Ivan Pillay
 * @title A user interface
 */
interface UserIntf {

  /// A generic events for user related operations
  event UserEvent(address indexed _addr, bytes32 _username, string _msg);

}
