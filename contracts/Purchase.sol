// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 < 0.9.0;
contract Purchase {
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
}