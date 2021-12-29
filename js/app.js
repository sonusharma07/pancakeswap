//https://forum.openzeppelin.com/t/how-to-fix-error-when-swap-tokens-on-pancakeswap-by-script/8326
//https://github.com/nhancv/pancake-swap-testnet/commit/be8ce5a0c69dafc5225ec351f662ba676869e0de
//BUSD : 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7
//pair response : 0x70C496660FE4eDf2db020101FA9544B40B5A3f87
App = {
    web3Provider: null,
    account: null,
    wbnb: null,
    router: null,
    addresses: {
        WBNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    },
    testAddress: {
        // WBNB : `0xae13d989dac2f0debff460ac112a837c89baa7cd`,
        WBNB: '0x0de8fcae8421fc79b29ade9fff97854a424cad09',
        factory: '0x5fe5cc0122403f06abe2a75dbba1860edb762985',
        router: '0xCc7aDc94F3D80127849D2b41b6439b7CF1eB4Ae0'
    },
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

        //initialize factory
        const factory = new ethers.Contract(
            App.testAddress.factory,
            ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
            signer
        );
        console.log(`factory`, factory);
        //initialize router
        const router = new ethers.Contract(
            App.testAddress.router,
            [
                'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
                'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
            ],
            signer
        );
        console.log(`router`, router);
        App.router = router
        //initialize wbnb
        const wbnb = new ethers.Contract(
            App.testAddress.WBNB,
            [
                'function approve(address spender, uint amount) public returns(bool)',
            ],
            signer
        );
        console.log(`wbnb`, wbnb);
        App.wbnb = wbnb;
        // await App.approveRouter()
    },
    approveRouter: async function () {
        const tradeAmount = ethers.utils.parseUnits('0.1', 'ether');
        console.log(`tradeAmount`, tradeAmount);
        const tx = await App.wbnb.approve(
            App.router.address,
            tradeAmount
        );
        const receipt = await tx.wait();
        console.log('Transaction receipt');
        console.log(receipt);
    },
    swapTokens: async function () {
        // var tokenIn = $("#tokenIn").val();
        // var tokenOut = $("#tokenOut").val();
        // console.log(tokenIn, tokenOut);
        const amountIn = ethers.utils.parseUnits('0.01', 'ether');
        console.log(`amountIn`, amountIn);
        const tokenIn = '0x0de8fcae8421fc79b29ade9fff97854a424cad09'
        const tokenOut = '0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7'
        const amounts = await App.router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
        console.log(`amount `, amounts[1].toNumber());
        //Our execution price will be a bit different, we need some flexbility
        const amountOutMin = amounts[1].sub(amounts[1].div(10));
        console.log(`
    Buying new token
    =================
    tokenIn: ${amountIn.toString()} ${tokenIn} (WBNB)
    tokenOut: ${amountOutMin.toString()} ${tokenOut}
  `);
        const tx = await App.router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            [tokenIn, tokenOut],
            App.account,
            Date.now() + 1000 * 60 * 10 //10 minutes
        );
        const receipt = await tx.wait();
        console.log('Transaction receipt');
        console.log(receipt);
    }
}

$(function () {
    $(window).load(async function () {
        await App.init()
    })
})