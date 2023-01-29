import React, { useEffect, useState } from 'react';
import getWeb3 from './getWeb3';
import Auction from './contracts/auction.json';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const App = () => {
  const [state, setState] = useState({
    web3: null,
    contract: null,
  });

  const [auctioneerAddress, setAuctioneerAddress] = useState(null);
 
  const [account, setAccount] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [highestBidder, setHighestBidder] = useState('');
  const [highestBid, setHighestBid] = useState('');
  
  useEffect(() => {
    const init = async () => {
      try {
        const web3 = await getWeb3();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = Auction.networks[networkId];
        const instance = new web3.eth.Contract(
          Auction.abi,
          deployedNetwork && deployedNetwork.address
        );

        setState({ web3, contract: instance });
        //get auctioneer address
        const getAuctioneerAddress = await instance.methods.auctioneer().call();
        setAuctioneerAddress(getAuctioneerAddress);
      } catch (error) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };
    init();
  }, []);
  const finalizeAuction = async () => {
    const { contract } = state;
    const accounts = await state.web3.eth.getAccounts();
    contract.methods
      .finalizeAuc()
      .send({ from: accounts[0] })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    toast.success('Auction Finalized Successfully');
  };
  const cancelAuction = async () => {
    const { contract } = state;
    const accounts = await state.web3.eth.getAccounts();
    const accountAddress = accounts[0];
    await contract.methods.cancelAuc().send({
      from: accountAddress,
    });
    toast.success('Auction Cancelled Successfully');
  };
  const placeBid = async () => {
    const { web3 } = state;
    const accounts = await web3.eth.getAccounts();
    const accountAddress = accounts[0];
    const { contract } = state;
    const value = web3.utils.toWei(bidAmount, 'ether');
    await contract.methods.bid().send({
      from: accountAddress,
      value: value,
    });
    toast.success('Bid Placed Successfully');
  };
  const setAccountListener = (provider) => {
    provider.on('accountsChanged', (accounts) => {
      setAccount(accounts[0]);
    });
  };
  useEffect(() => {
    const getAccount = async () => {
      const { web3 } = state;
      const accounts = await web3.eth.getAccounts();
      setAccountListener(web3.givenProvider);
      setAccount(accounts[0]);
    };
    state.web3 && getAccount();
  }, [state, state.web3, account]);
  const getHighestBidder = async () => {
    const { contract } = state;

    const getHighestBidder1 = await contract.methods.highestbidder().call();
    setHighestBidder(getHighestBidder1);
  };
  const getHighestBid = async () => {
    const { contract } = state;
    const getHighestBid = await contract.methods.highestBid().call();
    setHighestBid(getHighestBid);
  };
  const withdrawAmount = async () => {
    const { contract } = state;
    const accounts = await state.web3.eth.getAccounts();
    const accountAddress = accounts[0];
  await contract.methods.withdraw().send({
      from: accountAddress,
    });
    toast.success('Amount Withdrawn Successfully');
  };
  return (
    
    <div className="d-flex flex-column h-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <h1
          className="navbar-brand"
          style={{
            color: 'red',
            fontSize: '30px',
            fontWeight: 'bold',
            marginLeft: '10px',
          }}
        >
          Blockchain Based Auction System
        </h1>
      </nav>
      <div class="container">
        <div class="row g-2">
          <div class="col-6">
            <div class="p-3 border bg-light">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Place Bid</h5>
                  <p class="card-text">
                    <input
                      type="number"
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter Bid Amount in Ether"
                    />
                    <button onClick={placeBid}>Place Bid</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="p-3 border bg-light">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Highest Bid</h5>
                  <p class="card-text">
                    <h3>{highestBid}</h3>
                  </p>
                  <button onClick={getHighestBid}>Get Highest Bid</button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="p-3 border bg-light">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Highest Bidder</h5>
                  <p class="card-text">
                    <h3>{highestBidder}</h3>
                  </p>
                  <button onClick={getHighestBidder}>Get Highest Bidder</button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="p-3 border bg-light">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Withdraw Amount</h5>
                  <p class="card-text">
                    <button onClick={withdrawAmount}>Withdraw Amount</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="row g-2">
          <div class="col-6">
            <div class="p-3 border bg-light">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Finalize Auction</h5>
                  <p class="card-text">
                    <button onClick={finalizeAuction}>Finalize Auction</button>
                  </p>
                  <button onClick={cancelAuction}>Cancel Auction</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>

      <div class="col-6">
        <div class="p-3 border bg-light">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Auctioneer Address</h5>
              <p class="card-text">
                <h3>{auctioneerAddress}</h3>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-6">
        <div class="p-3 border bg-light">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Your Address</h5>
              <p class="card-text">
                <h3>{account}</h3>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer mt-auto py-3 bg-light">
        <div class="container">
          <span class="text-muted">Blockchain Based Auction System</span>
          <span class="text-muted">Made by: Shresht Sharma</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
