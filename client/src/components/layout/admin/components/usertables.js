import React,{ Component } from 'react';
import { MDBDataTable } from 'mdbreact';
import axios from 'axios'
import Swal from 'sweetalert2'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import 'mdbreact/dist/css/mdb.css';
import { CSVLink } from "react-csv";

class DataTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            userDetail:[],
            username:'',
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
        axios.get('/api/users/admin/getUsers').then(
        res => {
            Swal.close();
            var usersData = res.data;
            this.setState({
                userDetail: usersData
            })
        }
    )
    }

    viewDetails = (user) => {
      let useraddress = '';
      if(typeof user.address !== 'undefined'){
        useraddress = "<li><b>Street Address:</b>"+user.address.streetaddress+"</li>"+
        "<li><b>State:</b>"+user.address.state+"</li>"+
        "<li><b>City:</b>"+user.address.city+"</li>"+
        "<li><b>Pincode:</b>"+user.address.pincode+"</li>"
      }
        Swal.fire({
            title: 'User Details',
            html: 
            "<div class='container'>" +
            "<img src="+user.imgPath+" width='150px' />" +
            "<h4>"+user.name+"</h4>" +
            "<h6>"+user.number+"</h6>" +
            "<h6>"+user.email+"</h6>" +
            "<table class='table table-bordered table-hover table-striped'>" +
            "<tbody>" +
                "<tr>" +
                "<td>Address</td>" +
                "<td>"+useraddress+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Referral Id</td>" +
                "<td>"+user.referralId+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Referrer</td>" +
                "<td>"+user.referrer+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>PAN number</td>" +
                "<td>"+user.pan+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Account holder name</td>" +
                "<td>"+user.bankuser+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Account number</td>" +
                "<td>"+user.accnumber+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Bank Name</td>" +
                "<td>"+user.bankname+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>IFSC</td>" +
                "<td>"+user.ifsc+"</td>" +
                "</tr>" +
                "<tr>" +
                "<td>Status</td>" +
                "<td>"+user.active+"</td>" +
                "</tr>" +
            "</tbody>"+
            "</table>" +
            "</div>",
            showCancelButton: true,
            cancelButtonColor: '#d33',
          })
    }

    approveUser = (user) => {
      Swal.fire({
        title: "Please Wait...",
        allowOutsideClick: false
      })
      Swal.showLoading();
        axios.get('/api/queue/approve/'+user._id).then(
            result => {
                if(result){
                  Swal.close();
                    Swal.fire(
                        'Approved!',
                        'User has been added to the Queue.',
                        'success'
                    ).then(() => {
                      Swal.fire({
                        title: "Please Wait...",
                        allowOutsideClick: false
                      })
                      Swal.showLoading();
                      this.updateTable();
                    }
                    )
                }
                else{
                    alert("Failed")
                }
            }
        )
    }

    depositMoney = (user) => {
        Swal.fire({
            title: 'Enter the amount to deposit',
            input: 'number',
            inputAttributes: {
              autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Deposit',
            showLoaderOnConfirm: true,
            preConfirm: async (login) => {
                console.log(login)
              return await axios.get('/api/users/deposit/'+user._id+'@'+login)
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
          }).then((result) => {
              console.log(result)
            if (result.value) {
              Swal.fire(
                'Done!',
                'Money has been deposited.',
                'success'
              )
            }
          })
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
            return resultData[index] = {
                slno:data1.slno,
                name:data1.name,
                email:data1.email,
                date:data1.date,
                action:<div><button type="button" className="btn btn-primary" onClick={() => this.viewDetails(data1.all)}>View Details</button>
                </div>
            }
        })
        data.rows = resultData
    }
    let data2 = [
      ['userid','Date','Name','Stage','Level','Wallet','Payout Eligible','Email','Number','Street address','State','city','Pincode','Pan','Bank Name','Account holder Name','Account Number','IFSC']
    ];
    let data2arr = this.state.userDetail;
    data2arr.map((dataCsv,index) => {
      let rsname = dataCsv.all.name;
      let rsid = dataCsv.all._id;
      let rsdate = dataCsv.all.date;
      let rsstage = dataCsv.all.stage;
      let rslevel = dataCsv.all.level;
      let rswallet = dataCsv.all.wallet;
      let rspayEli = dataCsv.all.payout && dataCsv.all.payout.eligible;
      let rsemail = dataCsv.all.email;
      let rsnumber = dataCsv.all.number;
      let rsstreet = dataCsv.all.address && dataCsv.all.address.streetaddress;
      let rsstate = dataCsv.all.address && dataCsv.all.address.state;
      let rscity = dataCsv.all.address && dataCsv.all.address.city;
      let rspincode = dataCsv.all.address && dataCsv.all.address.pincode;
      let rspan = dataCsv.all.pan;
      let rsbankname = dataCsv.all.bankname;
      let rsbankuser = dataCsv.all.bankuser;
      let rsaccnumber = dataCsv.all.accnumber;
      let rsifsc = dataCsv.all.ifsc;
      data2.push([rsid,rsdate,rsname,rsstage,rslevel,rswallet,rspayEli,rsemail,rsnumber,rsstreet,rsstate,rscity,rspincode,rspan,rsbankname,rsbankuser,rsaccnumber,rsifsc])
    })
    let dateNow = new Date();
    let dateFormat = dateNow.getDate()+'-'+dateNow.getMonth()+'-'+dateNow.getFullYear();
    let filename = "ALl_users_list_"+dateFormat+".csv";
  return (
    <React.Fragment>
    <div class="exportCsv">
      <CSVLink data={data2} filename={filename} ><button type="button" className="btn btn-primary" >Export to CSV</button></CSVLink>;
    </div>
    <MDBDataTable
      striped
      bordered
      hover
      data={data}
      exportCSV
    />
    </React.Fragment>
  );
}
}

DataTable.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
)(DataTable);