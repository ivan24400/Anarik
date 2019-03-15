pragma solidity ^0.5.2;

import "./user/User.sol";
import "../util/StringUtil.sol";

contract Anarik is User{

  using StringUtil for string;

  // Simple Item/Good in the market
  struct Item {
    // internal delete flag
    bool _active;
    // Name of the Item
    string name;
    // Information about the item
    string description;
    // Price of the item in Snails
    uint256 price;
    // Is available on market
    bool available;
    // Current owner of the item.
    address owner;
  }

  // List of all items in the market
  Item[] private _items;
  uint256 getStoreItemIndex = 0;

  /// Fallback function
  function() external payable {}

  /**
   * @dev Create an item
   * @param _name product name
   * @param _description information about the item
   * @param _price price of the item in Snails
   * @param _owner current owner of the item
   * @return index of item
   */
  function createItem(
    string memory _name,
    string memory _description,
    uint256 _price,
    address _owner
  ) public
  returns (uint256)
  {
    Item memory temp = Item({
      _active : true,
      name : _name,
      description : _description,
      price : _price,
      available : false,
      owner : _owner
    });
    uint256 t = (_items.push(temp) - 1);
    return t;
  }

  /**
   * @dev Updates an item
   * @param _name product name
   * @param _description information about the item
   * @param _price price of the item in Snails
   * @param _index Index of item in the list
   * @param _username username of item owner
   * @param _password password of the item owner
   * @return index of item
   */
  function updateItem(
    string memory _name,
    string memory _description,
    uint256 _price,
    bool _available,
    uint256 _index,
    string memory _username,
    string memory _password
  ) public
  {
    require(
      (userMap[_username].account ==  _items[_index].owner) &&
      (keccak256(bytes(userMap[_username].passwd)) == keccak256(bytes(_password))),
      "Unauthorised access"
    );
    Item storage tmp = _items[_index];
    tmp.name = _name;
    tmp.description = _description;
    tmp.price = _price;
    tmp.available = _available;
  }

  /* Check if _index is valid within _items' array */
  modifier checkIndex(uint256 _index){
    require((_index < _items.length) && (_index >= 0),"Invalid index");
    _;
  }

  /**
   * @dev Delete an item from total items list
   * @param _index location of the item in _items array
   * @return operation status
   */
  function deleteItem(uint256 _index) public checkIndex(_index) returns(bool) {
    //Check if _index is valid within _items array
    _items[_index] = _items[_items.length - 1];
    delete _items[_items.length - 1];
    return true;
  }

  /**
   * @dev Change owner of item
   * @param _buyer Current owner of item
   * @param _seller New owner of the item.
   * @param _index Index of item in _items.
   * @return operation status
   */
  function changeOwner(
    address _buyer,
    string memory _buyer_log,
    address _seller,
    string memory _seller_log,
    uint256 _index
  )
     public
     checkIndex(_index)
  {
    Item storage tmp = _items[_index];
    require(
      (_seller == tmp.owner) &&
      (tmp._active == true),
      "Item not accessible"
    );
    tmp.available = false;
    tmp.owner = _buyer;
    addLog(addrUserMap[_buyer],_buyer_log);
    addLog(addrUserMap[_seller],_seller_log);
  }

  /* Returns total items in _items array */
  function getItemCount() public view returns(uint256) {
    return _items.length;
  }

  /**
   * @dev Return items owned by the user and which are not for sale.
   * @param _ownername user/owner name.
   * @param _index index of item in _itens
   * @return AFS, name, description and price of the item.
   */
  function getUserStoreItem(string memory _ownername, uint256 _index)
   public
   view
   returns(
    bool,
    string memory,
    string memory,
    uint256
   ) {
      require(
        (keccak256(bytes(getUserNameFromAcc(_items[_index].owner))) == keccak256(bytes(_ownername))) &&
        (_items[_index]._active == true),
        "Not user owned item"
      );

      Item memory i = _items[_index];

      return (
        i.available,
        i.name,
        i.description,
        i.price
      );
  }

  /**
   * @dev Get items sold by other seller
   * @param _index index of item in _items
   * @param _username current user
   * @return item name, description, price and seller name
   */
  function getPublicMarketItem(uint256 _index, string memory _username)
    public
    view
    returns(
      string memory,
      string memory,
      uint256,
      string memory owner
    ) {

      string memory ownername = getUserNameFromAcc(_items[_index].owner);

      require(
        (_items[_index].available == true) &&
        (_items[_index]._active == true) &&
        (keccak256(bytes(ownername)) != keccak256(bytes(_username))),
        "Item not available on market"
      );

      Item memory i = _items[_index];

      return (
        i.name,
        i.description,
        i.price,
        ownername
      );
  }


  /**
   * @dev Get a market item
   * @param _index index of item in _items
   * @return seller address, seller name, product name, description and price
   */
  function getItem(uint256 _index)
   public
   view
   returns(
    address,
    string memory,
    string memory,
    string memory,
    uint256
   ) {
     string memory ownername = getUserNameFromAcc(_items[_index].owner);

     require(
       (_items[_index]._active == true),
       "Item not available on market"
     );

     Item memory i = _items[_index];

     return (
       i.owner,
       ownername,
       i.name,
       i.description,
       i.price
     );
  }
}
