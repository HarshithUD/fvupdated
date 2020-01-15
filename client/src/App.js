import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import Landing from './components/layout/landing'
import ForgotPass from './components/layout/auth/forgotpass'
import NewPass from './components/layout/auth/newpass'
import AdminLanding from './components/layout/admin/landing'
import PayoutRequest from './components/layout/admin/components/payoutreq'
import { Provider } from 'react-redux'
import store from './store'
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";
import PrivateRoute from "./components/private-route/PrivateRoute";
import PrivateRouteAdmin from "./components/private-route/PrivateRouteAdmin";
import Dashboard from "./components/layout/dashboard/home";
import AdminDashboard from "./components/layout/admin/home";
import Wallet from "./components/layout/dashboard/components/wallet";
import Downtree from "./components/layout/dashboard/components/downline-tree";
import Settings from "./components/layout/admin/components/settings";
import Approve from './components/layout/admin/components/toApprove'
import Approved from './components/layout/admin/components/approvedUser'
import Activate from './components/layout/admin/components/activate'
import Declined from './components/layout/admin/components/declined'
import PayoutEli from './components/layout/admin/components/eligibleforpay'
import Transation from './components/layout/admin/components/transactions'
import TransationDetails from './components/layout/admin/components/transactionDetail'
import Index from './components/layout/index'

//check for local storage
if(localStorage.jwtToken){
  //Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  //Decode token to get userinfo
  const decoded = jwt_decode(token);
  //Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  //Check for expired token
  const currentTime = Date.now() / 1000; //to get in milliseconds
  if (decoded.exp < currentTime) {
  //Logout user
  store.dispatch(logoutUser());

  //Redirect to login
  window.location.href = "./login"
}
}


class App extends Component {
  render(){
  return (
    <Provider store={store}>
    <Router>
    <Route exact path="/signup" component={Landing} />
    <Route exact path="/forgot-password" component={ForgotPass} />
    <Route exact path="/new-password" component={NewPass} />
    <Route exact path="/" component={Index} />
    <Route exact path="/admin2019" component={AdminLanding} />
    <Switch>
      <PrivateRoute exact path="/dashboard" component={Dashboard} />
      <PrivateRouteAdmin exact path="/admin/dashboard" component={AdminDashboard} />
      <PrivateRouteAdmin exact path="/admin/payout-requests" component={PayoutRequest} />
      <PrivateRoute exact path="/wallet" component={Wallet} />
      <PrivateRoute exact path="/downline-tree" component={Downtree} />
      <PrivateRouteAdmin exact path="/admin/settings" component={Settings} />
      <PrivateRouteAdmin exact path="/admin/approve-users" component={Approve} />
      <PrivateRouteAdmin exact path="/admin/approved-users" component={Approved} />
      <PrivateRouteAdmin exact path="/admin/activate-users" component={Activate} />
      <PrivateRouteAdmin exact path="/admin/declined-users" component={Declined} />
      <PrivateRouteAdmin exact path="/admin/payout-eligible" component={PayoutEli} />
      <PrivateRouteAdmin exact path="/admin/transaction-details" component={Transation} />
      <PrivateRouteAdmin exact path="/admin/transaction-detail" component={TransationDetails} />
    </Switch>
    </Router>
    </Provider>
  );
}
}

export default App;
