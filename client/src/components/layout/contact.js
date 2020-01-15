import React, { Component } from 'react'
import Swal from 'sweetalert2'
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { contactData } from "../../actions/authActions";

class contact extends Component {
    constructor(props){
        super(props);
        this.state = {
            name: "",
            email: "",
            subject: "",
            msg: ""
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
      
    }

    handleChange = (e) => {
        const target = e.target;
        const value = target.value;
        const id = target.id;

        this.setState({
            [id]: value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        
        const contactForm = {
            name: this.state.name,
            email: this.state.email,
            subject: this.state.subject,
            msg: this.state.msg,
        };
        Swal.fire({
          title: "Please Wait...",
          allowOutsideClick: false
        })
        Swal.showLoading();
        this.props.contactData(contactForm);
        this.setState({
            name:'',email:'',subject:'',msg:''
        })
    }

    render() {
        return (
            <div class="contact_right p-lg-5 p-4">
                <form method="post" onSubmit={this.handleSubmit}>
                    <div class="w3_agileits_contact_left">
                        <h3 class="mb-3">Contact form</h3>
                        <input type="text" id='name' name="Name" placeholder="Your Name" required onChange={this.handleChange} value={this.state.name}/>
                        <input type="email" id='email' name="Email" placeholder="Your Email" required onChange={this.handleChange}  value={this.state.email}/>
                        <input type="text" id='subject' name="subject" placeholder="Subject" required onChange={this.handleChange}  value={this.state.subject}/>
                        <textarea id='msg' name='msg' value={this.state.msg} onChange={this.handleChange} required/>
                    </div>
                    <div class="w3_agileits_contact_right">
                        <button type="submit" >Submit Query</button>
                    </div>
                    <div class="clearfix"> </div>
                </form>
            </div>
        )
    }
}

contact.propTypes = {
    contactData: PropTypes.func.isRequired
  };
const mapStateToProps = state => ({
});
export default connect(
  mapStateToProps,
  { contactData }
)(withRouter(contact));