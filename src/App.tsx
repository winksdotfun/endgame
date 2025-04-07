import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateToken from "./pages/createToken";
import CreateWallet from "./pages/createWallet";
import WalletConnect from "./provider/Wallet.jsx";

const App: React.FC = () => {
  return (
    <Router>
      <div className="outfit-font relative">
        <nav className="bg-transparent p-4 absolute top-0 left-0 right-0 z-10">
          <div className="container flex justify-end space-x-8 items-center">
            <Link
              to="/create-token"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Create Token
            </Link>
            <Link
              to="/create-wallet"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Create Wallet
            </Link>
            <WalletConnect />

          </div>
        </nav>

        <Routes>
          <Route path="/create-token" element={<CreateToken />} />
          <Route path="/create-wallet" element={<CreateWallet />} />
          <Route path="/" element={<CreateToken />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
