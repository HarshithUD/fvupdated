import React, { Component } from 'react'
import Table from './usertables'

export default class dashboard extends Component {

    render() {
        return (
        <React.Fragment>
            {/* User Data table */}
            <h3>User Details</h3>
            {/* <select>
                <option>All Data</option>
                <option>Approved</option>
                <option></option>
            </select> */}
            <hr></hr>
        <Table/>
        </React.Fragment>
        )
    }
}
