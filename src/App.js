import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { GoldPriceProvider } from "./contexts/GoldPriceContext"
import { ThemeProvider}  from "./contexts/ThemeContext"
import HomePage from './pages/home/Home';
import Signup from './components/auth/signup/Signup';
import Login from "./components/auth/login/Login"
import ForgotPassword from "./components/auth/forgetPassword/ForgotPassword"
import PrivateRoute from "./components/privateRoute/PrivateRoutes"
import Dashboard from "./pages/dashboard/Dashboard"
import GoldCalculator from "./pages/calculations/calculator"
import TransactionHistory from './pages/History/History';
import Help from './pages/help/Help';
import About from "./components/aboutUs/AboutUs"
import Contact from './components/contact/Contact';
import PrivacyPolicy from './components/PrivacyPolicay/PrivacyPolicy';
import TermsOfService from './components/TermOfService/TermOfService';


function App() {
  return (
    <Router>
      <AuthProvider>
        <GoldPriceProvider>
          <ThemeProvider>
            <Routes>
              {/* public routes */}
              <Route path='/' element={ <HomePage/>}></Route>
              <Route path='signup' element={<Signup />}></Route>
              <Route path='login' element={<Login />}></Route>
              <Route path='forgot-password' element={<ForgotPassword />}></Route>

              {/* Private routes */}
              <Route path='/gold/dashboard' element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />

              <Route path='/gold/calculator' element={
                <PrivateRoute>
                  <GoldCalculator />
                </PrivateRoute>
              } />
              
              <Route path='/gold/history' element={
                <PrivateRoute>
                  <TransactionHistory />
                </PrivateRoute>
              } />

              <Route path='/gold/help' element={
                <PrivateRoute>
                  <Help />
                </PrivateRoute>
              } />
              <Route path='/about' element={
                <PrivateRoute>
                  <About />
                </PrivateRoute>
              } />
              <Route path='/contact' element={
                <PrivateRoute>
                  <Contact />
                </PrivateRoute>
              } />
              <Route path='/privacy' element={
                <PrivateRoute>
                  <PrivacyPolicy />
                </PrivateRoute>
              } />
              <Route path='/terms' element={
                <PrivateRoute>
                  <TermsOfService />
                </PrivateRoute>
              } />
            </Routes>
          </ThemeProvider>
        </GoldPriceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
