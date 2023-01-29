//SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

contract auction{
    address payable public auctioneer;
    uint public stblock;
    uint public etblock;

    enum aucState{started,cancelled,ended}
    aucState public state;

    uint public highestBid;
    address payable public highestbidder;

    mapping(address=>uint) bids;

    constructor(){
        auctioneer=payable(msg.sender);
        stblock=block.number;
        etblock=stblock+240;
        state=aucState.started;
    }

     modifier notowner(){
        require (msg.sender != auctioneer,"owner cannot bid");
        _;
    }

      modifier owner(){
        require (msg.sender == auctioneer);
        _;
    }
     modifier started(){
        require(block.number >stblock,"Auction has not started yet");
        _;
    }
     modifier beforeEnding(){
        require(block.number<=etblock,"Sorry auction ended!");
        _;
    }

    function bid() payable public notowner started beforeEnding returns(bool){
        require(msg.value>=1 ether,"Bid value must be greater than or equal to 1 ether");
        require(state==aucState.started);
        uint current_bid=bids[msg.sender]+msg.value;
        bids[msg.sender]=current_bid;
        if(current_bid>highestBid)
        {
            highestBid=current_bid;
            highestbidder=payable(msg.sender);
        }
        return true;
    }

    function cancelAuc() public returns(bool){
        require(msg.sender==auctioneer);
        require(state!=aucState.ended);
        state=aucState.cancelled;
        return true;
    }


    function finalizeAuc() public returns(bool){
        require(state!=aucState.cancelled);
        require(msg.sender==auctioneer);
        auctioneer.transfer(highestBid);
        bids[highestbidder]=0;
        highestBid=0;
        state=aucState.ended;
        return true;
    }
    address payable public recipient;
    function withdraw() public notowner{
      require(state==aucState.cancelled || state==aucState.ended);
      uint value=bids[msg.sender];
      recipient=payable(msg.sender);
      recipient.transfer(value);
      bids[msg.sender]=0;
    }
}