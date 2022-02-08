import Head from 'next/head'
import { useReducer, useState, useEffect } from 'react'
import Web3 from 'web3'
import 'bulma/css/bulma.css'
import styles from '../styles/EtherTransaction.module.css'
import etherTransactionContract from '../blockchain/vending'

const EtherTransaction = () => {
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [inventory, setInventory] = useState("")
    const [myTokenCount, setMyTokenCount] = useState("")
    const [buyCount, setBuyCount] = useState("")
    const [web3, setWeb3] = useState(null)
    const [address, setAddress] = useState(null)
    const [vmContract, setVmContract] = useState(null)
    // const [purchases, setPurchases] = useState(0)

    useEffect(() => {
        if (vmContract) getInventoryHandler()
        if (vmContract && address) getMyTokenCountHandler()
    }, [vmContract, address])
    // [vmContract, address, purchases]
    const getInventoryHandler = async () => {
        const inventory = await vmContract.methods.getVendingMachineBalance().call()
        setInventory(inventory)
    }


    const getMyTokenCountHandler = async () => {
        const count = await vmContract.methods.donutBalances(address).call()
        setMyTokenCount(count)
    }

    const updateTokenQuant = event => {
        setBuyCount(event.target.value)
    }

    const buyTokenHandler = async () => {
        try {
            await vmContract.methods.purchase(buyCount).send({
                from: address,
                value: web3.utils.toWei('0.01', 'ether') * buyCount
            })
            // setPurchases(purchases++)
            setSuccessMsg(`Token Purchased: ${buyCount}`)

            if (vmContract) getInventoryHandler()
            if (vmContract && address) getMyTokenCountHandler()
        } catch (err) {
            setError(err.message)
        }

    }

    // Provider API
    const connectWalletHandler = async () => {
        // Check if Wallet is available
        if (typeof window != "undefined" && typeof window.ethereum !== "undefined") {
            try {
                // Request wallet connect
                await window.ethereum.request({ method: "eth_requestAccounts" })
                // Setting web3 instance
                web3 = new Web3(window.ethereum)
                setWeb3(web3)
                const accounts = await web3.eth.getAccounts()
                setAddress(accounts[0])

                const vm = etherTransactionContract(web3)
                setVmContract(vm)
            } catch (err) {
                setError(err.message)
            }
        }
        else {
            // Metamask not installed
            console.log("Please install a Metamask wallet if you would like to use this site's features.")
        }
    }
    return (
        <div className={styles.main}>
            <Head>
                <title>Ether Transaction App</title>
                <meta name="description" content="A blockchain transaction application" />
            </Head>
            <nav className="navbar mt-4 mb-4cd ">
                <div className="container">
                    <div className="navbar-brand">
                        <h1>Transaction Application</h1>
                    </div>
                    <div className="navbar-end">
                        <button onClick={connectWalletHandler} className="button-is-primary">Connect Wallet</button>
                    </div>
                </div>
            </nav>
            <section>
                <div className="container">
                    <h2>
                        Contract Token Inventory: {inventory}
                    </h2>
                </div>
            </section>
            <section>
                <div className="container">
                    <h2>
                        My Token Inventory: {myTokenCount}
                    </h2>
                </div>
            </section>
            <section className="mt-5">
                <div className="container">
                    <div className="field">
                        <label className="label">Buy Tokens</label>
                        <div className="control">
                            <input onChange={updateTokenQuant} className="input" type="type" placeholder="Enter Token Amount..." />
                        </div>
                        <button onClick={buyTokenHandler} className="button-is-primary mt-4">Purchase Token</button>
                    </div>
                </div>
            </section>
            <section>
                <div className="container has-text-danger">
                    <p>{error}</p>
                </div>
            </section>
            <section>
                <div className="container has-text-success">
                    <p>{successMsg}</p>
                </div>
            </section>
        </div >
    )
}

export default EtherTransaction