import Web3 from "web3"
import detectEthereumProvider from '@metamask/detect-provider';
import "./css/App.css";

import { useEffect, useState } from "react";
import { loadContract } from "./utils/load-contract";

function App() {


  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null
  })

  const [balance, setBalance] = useState(null)
  const [account, setAccount] = useState(null)
  const [reload, setReload] = useState(false)

  //call this with a function that changes the balance to update the UI through loadBalance
  const reloadUI = () => setReload(!reload)

  //call hooks into a listener in metamask API, trigger when account is changed.
  const setAccountListener = provider => {
    provider.on("accountsChanged", _ => window.location.reload())

    // provider._jsonRpcConnection.events.on("notification", payload => {
    //   const { method } = payload

    //   if (method === "metamask_unlockStateChanged") {
    //     setAccount(null)
    //   }
    // })
  }

  useEffect(() => {
    // detect provider set state variable that holds web3Api
    const loadProvider = async () =>{
      const provider = await detectEthereumProvider()

      if (provider) {
        const contract = await loadContract("Migrations", provider) //contract here is an example

        setAccountListener(provider)
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })
      } else {
        console.error("Please install metamask")
      }
    };

    loadProvider()
  }, [account]);

  //page displays balance of contract that is specified in loadContract
  useEffect(()=> {
    const loadBalance = async () => {
      const { contract,web3 } = web3Api
      const balance = await web3.eth.getBalance(contract.address)

      setBalance(web3.utils.fromWei(balance, "ether"))
    }

    web3Api.contract && loadBalance()
  }, [web3Api, reload])

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
            </>:
            !web3Api.provider ?
              <>
                <div className="notification is-warning is-small is-rounded">
                  Wallet is not detected!
                  <a target="_blank" href="https://docs.metamask.io"></a>
                </div>
              </>:
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
          Current Balance: <strong>{balance}</strong> ETH
        </div>
      </div>
    </div>
  );
}

export default App;
