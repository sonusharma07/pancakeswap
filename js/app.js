App = {
    web3Provider: null,
    account: null,
    init: async function () {
        console.log(`init....`)
        await App.initWeb3()
    },
    initWeb3: async function () {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Prompt user for account connections
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        console.log("Account:", await signer.getAddress());
        App.account = await signer.getAddress()
        $("#accountAddress").html("Your account: " + App.account)
    },
    swapTokens: function () {
        var tokenIn = $("#tokenIn").val();
        var tokenOut = $("#tokenOut").val();
        console.log(tokenIn, tokenOut);
    }
}

$(function () {
    $(window).load(async function () {
        await App.init()
    })
})