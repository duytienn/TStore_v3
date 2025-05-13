// public/js/checkout-crypto.js
window.addEventListener('load', async () => {
  // thiết lập hằng số
  const RECIPIENT   = document.querySelector('strong').textContent && typeof window.USDT_RECIPIENT !== 'undefined'
                     ? window.USDT_RECIPIENT 
                     : '0xb1a5c0d80dAD939C345010dB3D7491c9CBF4f78C';
  const USDT_ADDRESS = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
  const ARBITRUM_CHAIN_ID = '0xa4b1'; // 42161 dạng hex
  
  const USDT_ABI = [
    // minimal ERC20 ABI
    { "constant": false, "inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],
      "name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function" },
    { "constant": true, "inputs":[{"name":"_owner","type":"address"}],
      "name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function" },
    { "constant": true, "inputs":[], "name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function" }
  ];
  
  // init Web3 & MetaMask
  if (!window.ethereum) {
    return show('Vui lòng cài MetaMask', 'danger');
  }
  
  const web3 = new Web3(window.ethereum);
  let account;
  
  try {
    [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    show(`Đã kết nối ví: ${account.substring(0, 6)}...${account.slice(-4)}`, 'success');
  } catch (e) {
    return show('Từ chối kết nối ví', 'danger');
  }
  
  // Kiểm tra và chuyển mạng nếu cần
  const networkSwitched = await checkAndSwitchNetwork();
  if (!networkSwitched) {
    return show('Vui lòng chuyển sang mạng Arbitrum để tiếp tục', 'danger');
  }
  
  const token = new web3.eth.Contract(USDT_ABI, USDT_ADDRESS);
  
  // Thêm nút ước tính phí gas
  const estimateButton = document.createElement('button');
  estimateButton.id = 'estimateGasBtn';
  estimateButton.className = 'btn btn-secondary btn-block mt-2';
  estimateButton.textContent = 'Ước tính phí gas';
  document.getElementById('gasLimit').parentNode.after(estimateButton);
  
  // Thêm phần hiển thị ước tính
  const estimateDiv = document.createElement('div');
  estimateDiv.className = 'alert alert-info mt-2';
  estimateDiv.id = 'gasEstimate';
  estimateDiv.style.display = 'none';
  estimateButton.after(estimateDiv);
  
  // Xử lý sự kiện ước tính gas
  document.getElementById('estimateGasBtn').addEventListener('click', async () => {
    await estimateGasFee();
  });
  
  // Hàm ước tính phí gas
  async function estimateGasFee() {
    try {
      // Lấy số lượng USDT
      const usdtAmountText = document.querySelector('strong').textContent.trim();
      const usdtAmount = parseFloat(usdtAmountText);
      
      if (isNaN(usdtAmount) || usdtAmount <= 0) {
        return show('Giá trị USDT không hợp lệ', 'danger');
      }
      
      // Lấy decimals
      const decimals = await token.methods.decimals().call();
      
      // Chuyển đổi chính xác như trong test.html
      const amountInWei = web3.utils.toBN(
        web3.utils.toWei(usdtAmount.toString(), 'ether')
      ).div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - parseInt(decimals)))).toString();
      
      // Ước tính gas
      const gasEstimate = await token.methods.transfer(
        RECIPIENT, 
        amountInWei
      ).estimateGas({ from: account });
      
      // Cập nhật gas limit với 20% dự phòng
      const recommendedGasLimit = Math.round(gasEstimate * 1.2);
      document.getElementById('gasLimit').value = recommendedGasLimit;
      
      // Tính phí gas
      const gasPriceGwei = document.getElementById('gasPrice').value;
      const gasPriceWei = web3.utils.toWei(gasPriceGwei, 'gwei');
      const totalGasCost = web3.utils.toBN(gasPriceWei).mul(web3.utils.toBN(recommendedGasLimit));
      const totalGasCostEth = web3.utils.fromWei(totalGasCost.toString(), 'ether');
      
      // Hiển thị ước tính
      const estimateEl = document.getElementById('gasEstimate');
      estimateEl.textContent = `Ước tính phí gas: ${totalGasCostEth} ETH`;
      estimateEl.style.display = 'block';
      
      return true;
    } catch (error) {
      show(`Lỗi ước tính gas: ${error.message}`, 'danger');
      return false;
    }
  }
  
  // Hàm kiểm tra và chuyển mạng
  async function checkAndSwitchNetwork() {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== ARBITRUM_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ARBITRUM_CHAIN_ID }]
        });
        return true;
      } catch (switchError) {
        // Nếu mạng chưa được thêm vào MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: ARBITRUM_CHAIN_ID,
                chainName: 'Arbitrum One',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                blockExplorerUrls: ['https://arbiscan.io']
              }]
            });
            return true;
          } catch (addError) {
            show('Không thể thêm mạng Arbitrum vào MetaMask', 'danger');
            return false;
          }
        } else {
          show('Không thể chuyển sang mạng Arbitrum', 'danger');
          return false;
        }
      }
    }
    return true;
  }
  
  // Xử lý nút thanh toán
  document.getElementById('sendCrypto').addEventListener('click', async () => {
    // Kiểm tra thông tin người dùng
    const fullName = document.getElementById('fullName').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    if (!fullName || !phone || !address) {
      return show('Vui lòng nhập đầy đủ thông tin nhận hàng', 'danger');
    }
    
    // Kiểm tra mạng một lần nữa
    const networkSwitched = await checkAndSwitchNetwork();
    if (!networkSwitched) {
      return;
    }
    
    // Lấy số lượng USDT
    const usdtAmountText = document.querySelector('strong').textContent.trim();
    const usdtAmount = parseFloat(usdtAmountText);
    
    if (isNaN(usdtAmount) || usdtAmount <= 0) {
      return show('Giá trị USDT không hợp lệ', 'danger');
    }
    
    // Lấy decimals
    const decimals = await token.methods.decimals().call();
    
    // Chuyển đổi chính xác như trong test.html
    const amountInWei = web3.utils.toBN(
      web3.utils.toWei(usdtAmount.toString(), 'ether')
    ).div(web3.utils.toBN(10).pow(web3.utils.toBN(18 - parseInt(decimals)))).toString();
    
    // Lấy gas settings
    const gasPrice = web3.utils.toWei(document.getElementById('gasPrice').value, 'gwei');
    const gasLimit = document.getElementById('gasLimit').value;
    
    show('Đang gửi giao dịch…', 'info');
    
    // Gọi transfer với tham số gas
    token.methods.transfer(RECIPIENT, amountInWei)
      .send({ from: account, gasPrice, gas: gasLimit })
      .on('transactionHash', hash => show(`Đã gửi TX: ${hash}`, 'success'))
      .on('receipt', async (r) => {
        show('Giao dịch thành công! Đang xử lý đơn hàng...', 'success');
        
        // Lấy thông tin form
        const formData = {
          fullName: document.getElementById('fullName').value,
          phone: document.getElementById('phone').value,
          address: document.getElementById('address').value
        };
        
        // Gửi request đặt hàng
        try {
          const response = await fetch('/checkout/order-crypto', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          const result = await response.json();
          if (result.success) {
            window.location.href = `/checkout/success/${result.orderId}`;
          } else {
            show('Lỗi khi xử lý đơn hàng', 'danger');
          }
        } catch (error) {
          show('Lỗi: ' + error.message, 'danger');
        }
      })
      .on('error', err => show('Lỗi: '+err.message, 'danger'));
  });
  
  function show(msg, type) {
    const el = document.getElementById('cryptoStatus');
    el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  }
});