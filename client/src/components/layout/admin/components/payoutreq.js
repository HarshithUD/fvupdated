import React, { Component } from 'react'
import Sidebar from './sidebar'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import '../../../../view/css/downtree.css'
import Axios from 'axios';
import { MDBDataTable } from 'mdbreact';
import Swal from 'sweetalert2'
import 'mdbreact/dist/css/mdb.css';
import { CSVLink } from "react-csv";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class payoutreq extends Component {
    constructor(props){
        super(props);
        this.state = {
            userDetail:[],
            username:'',
            startDate: '',
            toDate: new Date(),
            dateerror:''
        }

        this.updateTable = this.updateTable.bind(this);
    }
    componentDidMount(){
        Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
          })
        Swal.showLoading();
        this.updateTable();
    }

    updateTable = () => {
        Axios.get('/api/users/admin/getUsers').then(
        res => {
            Swal.close();
            var usersData = res.data;
            this.setState({
                userDetail: usersData
            })
        }
    )
    }

    updateFilter = () => {
      if(this.state.startDate > this.state.toDate){
        this.setState({
          dateerror: 'Error! Start date should be less than To Date'
        })
      }
      else{
        this.setState({
          dateerror:''
        })
      }
    }

    handleChangeDate = date => {
      this.setState({
        startDate: date
      });
    };

    handleChangeToDate = date => {
      this.setState({
        toDate: date
      });
    };


    acceptPay = (user) => {
      let userid = user._id;
      if(user.payout.eligible > 0){
        Swal.fire({
            title: 'Amount Eligibled for Payout',
			inputAttributes: {
			autocapitalize: 'off'
			},
            showCancelButton: true,
            html:
              '<h4 style="color:green;font-weight:700">Rs. '+user.payout.eligible+'</h4><p><label for="a1">Mode of transfer: </label><input class="form-control" id="a1" type="text" name="a1" /></p><p><label for="a2">Transaction ID: </label><input id="a2" name="a2" class="form-control" type="text" /></p>',
            confirmButtonText: 'Transfer',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
				var mode_values = [];
				mode_values = [
				  document.getElementById('a1').value,
				  document.getElementById('a2').value
				];
				var mode_values1 = mode_values[0].replace(/[^a-zA-Z0-9]/g, '');
				var mode_values2 = mode_values[1].replace(/[^a-zA-Z0-9]/g, '');
               return await Axios.get('/api/users/acceptPay/'+userid+'@!'+user.payout.eligible+'@!'+mode_values1+'@!'+mode_values2)
                .then(response => {
                  if (!response.data) {
                    throw new Error(response.statusText)
                  }
                  return response.data
                })
                .catch(error => {
                  Swal.showValidationMessage(
                    `Request failed: ${error}`
                  )
                }) 
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then(async (result) => {
              console.log(result)
            if (result.value) {
              Swal.fire(
                'Done!',
                'Money has been deposited.',
                'success'
              )
              Swal.fire({
                title: "Please Wait...",
                allowOutsideClick: false
              })
            Swal.showLoading();
            this.updateTable();
            }
          })
        }
        else{
          Swal.fire(
            'Payout is lesser than 0',
            '',
            'error'
          )
        }
    }

    render() {
        let data =  {
            columns: [
                {
                    label: '#',
                    field: 'slno',
                    sort: 'asc'
                },
                {
                    label: 'Name',
                    field: 'name',
                    sort: 'asc'
                },
                {
                    label: 'Email',
                    field: 'email',
                    sort: 'asc'
                },
                {
                    label: 'Date',
                    field: 'date',
                    sort: 'asc'
                },
                {
                  label: 'Eligible amt',
                  field: 'eligibleamt',
                  sort: 'asc'
                },
                {
                    label: 'Action',
                    field: 'action',
                    sort: 'asc'
                },
            ],
            rows: [
               {
                }
            ]
        }
        let resultData = [];
        if(this.state.userDetail.length>0){
            let arr1 = this.state.userDetail;
            arr1.map((data1,index) => {
              var dateAt = new Date(data1.date);
                if(typeof data1.all.payout !='undefined' && data1.all.payout.requested===true && (dateAt >= this.state.startDate) && (dateAt <= this.state.toDate)){
                    return resultData[index] = {
                        slno:data1.slno,
                        name:data1.name,
                        email:data1.email,
                        date:data1.date,
                        eligibleamt:'Rs. '+data1.all.payout.eligible,
                        action:<button type="button" className="btn btn-primary" onClick={() => this.acceptPay(data1.all)}>Accept Payout</button>
                    }
                }
            })
            data.rows = resultData
        }
        const { user } = this.props.auth;
        let data2 = [
            ['Name','Email','Number','Address','Pan']
          ];
          let data2arr = this.state.userDetail;
          data2arr.map((dataCsv,index) => {
            var dateAt2 = new Date(dataCsv.date);
            if( (dateAt2 >= this.state.startDate) && (dateAt2 <= this.state.toDate)){
            let rsname = dataCsv.all.name;
            let rsemail = dataCsv.all.email;
            let rsnumber = dataCsv.all.number;
            let rsaddress = dataCsv.all.address;
            let rspan = dataCsv.all.pan;
            data2.push([rsname,rsemail,rsnumber,rsaddress,rspan])
            }
          })
          let dateNow = new Date();
          let dateFormat = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear();
          let filename = "Payout_Requested_list_"+dateFormat+".csv";
        return (
            <div className="page-wrapper chiller-theme toggled">
                <Sidebar adminDetails={user} />
                <main className="page-content">
			    <div className="container-fluid">
                <h3>Payout Requests</h3>
                <hr></hr>
                <div class="exportCsv">
                <CSVLink data={data2} filename={filename} ><button type="button" className="btn btn-primary" >Export to CSV</button></CSVLink>
                </div>
                <div>
      From: <DatePicker
        selected={this.state.startDate}
        onChange={this.handleChangeDate}
        dateFormat="dd/MM/yyyy"
        placeholderText="DD/MM/YYYY"
        onCalendarClose={this.updateFilter}
      />
      To: <DatePicker
        selected={this.state.toDate}
        onChange={this.handleChangeToDate}
        placeholderText="DD/MM/YYYY"
        dateFormat="dd/MM/yyyy"
        onCalendarClose={this.updateFilter}
      />
      <p className="red-text">{this.state.dateerror}</p>
      </div>
                <MDBDataTable
                    striped
                    bordered
                    hover
                    data={data}
                    exportToCSV 
                />
                </div>
                </main>
            </div>
        )
    }
}

payoutreq.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
)(payoutreq);