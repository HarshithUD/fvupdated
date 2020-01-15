import React,{ Component } from 'react';
import { MDBDataTable } from 'mdbreact';
import axios from 'axios'
import Swal from 'sweetalert2'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Sidebar from './sidebar'
import 'mdbreact/dist/css/mdb.css';
import { CSVLink } from "react-csv";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class transDetail extends Component{
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
      const query = new URLSearchParams(this.props.location.search);
      const userId = query.get('id')
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        this.updateTable(userId);
    }

    updateTable = (userId) => {
        axios.get('/api/users/getDetails/'+userId).then(
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


render() {
    let data =  {
        columns: [
            {
                label: '#',
                field: 'slno',
                sort: 'asc'
            },
            {
                label: 'Transaction Id',
                field: 'transId',
                sort: 'asc'
            },
            {
                label: 'Name',
                field: 'name',
                sort: 'asc'
            },
            {
                label: 'Type',
                field: 'type',
                sort: 'asc'
            },
            {
                label: 'Amount',
                field: 'amount',
                sort: 'asc'
            },
            {
                label: 'Date',
                field: 'date',
                sort: 'asc'
            }
        ],
        rows: [
           {
            }
        ]
    }
    let resultData = [];
    if(this.state.userDetail && this.state.userDetail.transactions && this.state.userDetail.transactions.length>0){
        let arr1 = this.state.userDetail.transactions;
        var count = 0;
        arr1.map((data1,index) => {
          var dateAt = new Date(data1.date);
          if((dateAt >= this.state.startDate) && (dateAt <= this.state.toDate)){
          return resultData[index] = {
              slno:++count,
              transId:data1._id,
              name:data1.name,
              type:data1.type,
              amount:data1.amount,
              date:data1.date
              }      
            }      
        })
        data.rows = resultData
    }
    let data2 = [
      ['Transaction Id','Date','Name','Type','Amount']
    ];
    let dataArr = this.state.userDetail;
    if(dataArr.transactions && dataArr.transactions.length>0){
      dataArr.transactions.map((dataCsv,index)=>{
        var dateAt2 = new Date(dataCsv.date);
        if((dateAt2 >= this.state.startDate) && (dateAt2 <= this.state.toDate)){
        let rsname = dataCsv.name;
        let rsid = dataCsv._id;
        let rsdate = dataCsv.date;
        let rstype = dataCsv.type;
        let rsamount = dataCsv.amount;
        data2.push([rsid,rsdate,rsname,rstype,rsamount])
        }
      })
    }
    let dateNow = new Date();
    let dateFormat = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear();
    let filename = this.state.userDetail && typeof this.state.userDetail.name !== 'undefined' && 'of_'+this.state.userDetail.name+'_'+dateFormat+".csv";
    const { user } = this.props.auth;
  return (
    <div className="page-wrapper chiller-theme toggled">
      <Sidebar adminDetails={user} />
      <main className="page-content">
        <div className="container-fluid">
        <h3>Transaction Detail {this.state.userDetail && typeof this.state.userDetail.name !== 'undefined' && 'of '+this.state.userDetail.name}</h3>
          <hr></hr>
          <div class="exportCsv">
          <CSVLink data={data2} filename={filename} ><button type="button" className="btn btn-primary" >Export to CSV</button></CSVLink>;
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
          exportCSV 
          />
        </div>
    </main>
    </div>
  );
}
}

transDetail.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
)(transDetail);