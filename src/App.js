import Web3 from "web3"
import detectEthereumProvider from '@metamask/detect-provider';
import "./css/App.css";

import { useEffect, useState } from "react";

function App() {


  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null
  })

  const [account, setAccount] = useState(null)

  useEffect(() => {
    // detect provider set state variable that holds web3Api
    const loadProvider = async () =>{
      const provider = await detectEthereumProvider()

      if (provider) {
        setWeb3Api({
          web3: new Web3(provider),
          provider
        })
      } else {
        console.error("Please install metamask")
      }
    };

    loadProvider()
  }, []);

  useEffect(() => {
    //uses web3Api instantiated abov to get accounts array
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()

      setAccount(accounts[0])
    }

    //executed only if you have a web3 api
    web3Api.web3 && getAccounts()
    //executed every time web3 is assigned
  }, [web3Api.web3]);

  return (
    <div className="application-wrapper">
    <div className="connect-account-controls">
        <div className="is-flex is-align-items-center">
          { account ?
            <>
              <span>
                <strong className="mr-2">Account:</strong>
              </span>
              <div>
                {account}
              </div>
            </>
            :
            <button
              className="button is-info"
              onClick={() =>
                web3Api.provider.request({method: "eth_requestAccounts"}
              )}
            >
              Connect Metamask
            </button>
          }
        </div>
        <div className="balance-view is-size-2 my-4">
          Current Balance: <strong>10</strong> ETH
        </div>
      </div>
    </div>
  );
}

export default App;
