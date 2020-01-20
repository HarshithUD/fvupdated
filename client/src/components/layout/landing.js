import React, { Component } from 'react'
import Login from './auth/login'
import Register from './auth/register'

export default class landing extends Component {
    componentDidMount(){
      document.body.style.backgroundColor = "#4a156b";
    }
    render() {
        return (
          <div className="container">
            <div className="row" style={{paddingTop:'3rem',paddingBottom:'3rem'}}>
              <Login />
              <Register />
            </div>
          </div>
        )
    }
}
