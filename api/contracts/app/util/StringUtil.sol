pragma solidity ^0.5.2;

library StringUtil {
  /**
   * @dev Concatenates two strings
   * @param a implicit string variable
   * @param b string which is to be appended
   * @return b appended to a
   */
  function append(string memory a, string memory b) internal pure returns (string memory) {
    return string(abi.encodePacked(a, b));
  }

}
