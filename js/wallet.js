import { Aptos, Network } from '@aptos-labs/ts-sdk';

class WalletManager {
    constructor() {
        this.aptos = new Aptos(Network.TESTNET);
        this.account = null;
        this.init();
    }

    init() {
        this.connectButton = document.getElementById('connect-wallet');
        this.walletStatus = document.getElementById('wallet-status');
        this.gameSection = document.getElementById('game-section');
        
        this.connectButton.addEventListener('click', () => this.connectWallet());
    }

    async connectWallet() {
        try {
            if (!window.petra) {
                alert('Please install Petra wallet extension');
                return;
            }

            const wallet = window.petra;
            await wallet.connect();
            const account = await wallet.account();
            this.account = account;

            this.walletStatus.textContent = `Connected: ${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
            this.gameSection.classList.remove('hidden');
            this.connectButton.classList.add('hidden');

            // Dispatch event for other modules
            window.dispatchEvent(new CustomEvent('walletConnected', { detail: account }));
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    }
}

// Initialize wallet manager
const walletManager = new WalletManager();
export default walletManager;