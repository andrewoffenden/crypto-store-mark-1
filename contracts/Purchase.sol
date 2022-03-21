// SPDX-License-Identifier: GPL-3.0
// This contract is inspired by example contract in the solidity documentation
// for safe remote purchases.

pragma solidity >=0.8.0 < 0.9.0;
contract Purchase {
    // value will be the value of the fee.
    uint public value;
    address payable public seller;
    address payable public buyer;

    enum State {
        Created,
        Locked,
        Release,
        Inactive
    }

    State public state;

    modifier condition(bool condition_) {
        require(condition_);
        _;
    }

    // Only buyer can call this function
    error OnlyBuyer();
    // Only seller can call this function
    error OnlySeller();
    // The function cannot be called at the current state
    error InvalidState();
    // The provided value is incorrect. This will
    // make sure that added value is included in the price
    // of the item being bought or sold. This is a deviation
    // of the solidity documentation. Here we are using different
    // additional value that is not neccessarily double the price.
    error InvalidAmount();

    modifier onlyBuyer() {
        if(msg.sender != buyer)
            revert OnlyBuyer();
        _;
    }

    modifier onlySeller() {
        if(msg.sender != seller)
            revert OnlySeller();
        _;
    }

    modifier inState(State state_) {
        if(state != state_)
            revert InvalidState();
        _;
    }

    event Aborted();
    event PurchaseConfirmed(address _buyer, uint _value);
    event ItemReceived();
    event SellerRefunded();

    // FUTURE:: This needs to be able to receive
    // the ammount of crypto, and check that the
    // amount is a percentage higher than the 
    // value of the item being sold.
    /*constructor() payable {
        seller = payable(msg.sender);
        value = msg.value;
    }*/

    // This constructor will be used for simple 
    // crypto store.
    constructor() {
        seller = payable(msg.sender);
        state = State.Created;
    }

    // This is the function to buy an item
    function buyItem() external inState(State.Created) payable {
        emit PurchaseConfirmed(msg.sender, msg.value);
        state = State.Locked;
        seller.transfer(msg.value);
    }

    // Abort purchase and reclaim crypto.
    // Can only be called by the seller before
    // the contract is locked.
    function abort() external onlySeller inState(State.Created) {
        emit Aborted();
        state = State.Inactive;
        // Transfer here because it is the last
        // call in this function. reentrancy-safe.
        //seller.transfer(address(this).balance);
    }

    // Confirm the purchase as a buyer.
    // Transaction has to include the additional fee
    // The crypto will be locked until confirmReceived
    // is called.
    // FUTURE:: Work on the value to make sure this is working properly.
    function confirmPurchase() external inState(State.Created) condition(msg.value == value) payable {
        emit PurchaseConfirmed(msg.sender, msg.value);
        buyer = payable(msg.sender);
        state = State.Locked;
    }

    // Confirm the buyer received the item.
    // This will release the locked crypto.
    // FUTURE :: Get the fee value fixed.
    function confirmReceived() external onlyBuyer inState(State.Locked) {
        emit ItemReceived();
        // Important to change the state first. Prevents it from being called again.
        state = State.Release;
        buyer.transfer(value);
    }

    // This function refunds the seller. Pays back the locked funds.
    // FUTURE :: Get the value fixed.
    function refundSeller() external onlySeller inState(State.Release) {
        emit SellerRefunded();
        // Change state first to prevent being called again.
        state = State.Inactive;
        seller.transfer(value);
    }
}