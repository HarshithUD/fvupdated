import React, { Component } from 'react'
import './../../../../view/css/wallet.css'
import Sidebar from './sidebar'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Axios from 'axios';
import Swal from 'sweetalert2'

class wallet extends Component {
	constructor(props){
		super(props);
		this.state = {
			redeem:false
		}
	}
    componentDidMount(){
		Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
		})
		Swal.showLoading();
		this.getTransactionDetails(this.props.auth);
		this.run(this.props.auth);
	}

	run = async (propsRec) => {
		var a = await getTrans(propsRec);
        var cards = [
			{
				type: "visa",
				name: a.bankname,
				accnumber: a.accnumber,
				bankuser: a.bankuser,
				ifsc: a.ifsc,
				transactions: a.transactions
			}
		];
		this.setState({
			redeem:true
		})
	//Print Cards
	function getTrans(propsRec){
		return new Promise((resolve,rej) => {
			Axios.get('/api/users/getTransaction/'+propsRec.user.id).then(
				res => {
					Swal.close();
					resolve(res.data)
				}
			)
		})
	}

function generateCards() {
	var output = "";
	cards.forEach(function(cards, index) {
		output += "<div class='credit-card " + cards.type + "'>";
		output += "<div class='credit-card_number'>Bank Name:" + cards.name + "</div>";
		output += "<div class='credit-card_number'>Account number: " + cards.accnumber + "</div>";
		output += "<div class='credit-card_number'>Account Holder Name: " + cards.bankuser + "</div>";
		output += "<div class='credit-card_number'>Bank IFSC:" + cards.ifsc + "</div>";
		output += "</div>"
	});
	return output;
}
		//Display Cards on Page
		document.querySelector('.cards').innerHTML = generateCards();
		//Add initial active class
		document.querySelector('.credit-card.visa').classList.add('active');;

		//Print Cards
		function showTransactions(creditCards, card) {
			var output = "";
			var total = 0;
		//if card is active print its transactions from cards data 
			for (var i = 0; i < creditCards.length; i++) {
				if (creditCards[i] === card) {
					for (var n = 0; n < cards[i].transactions.length; n++) {

						var getDate = new Date(cards[i].transactions[n].date);
						var hours = getDate.getHours();
						var minutes = getDate.getMinutes();
						var ampm = hours >= 12 ? 'pm' : 'am';
						hours = hours % 12;
						hours = hours ? hours : 12; // the hour '0' should be '12'
						minutes = minutes < 10 ? '0'+minutes : minutes;
						var strTime = hours + ':' + minutes + ' ' + ampm;
						var formatDate = getDate.getDay()+"-"+(getDate.getMonth()+1)+"-"+getDate.getFullYear()+" "+strTime;
						output += "<div class='transaction-item " + cards[i].transactions[n].type + "'>";
						output += "<div class='transaction-item_details'>";
						output += "<h3>"+ cards[i].transactions[n].name +"</h3>";
						if((cards[i].transactions[n].name).toLowerCase() === 'payout'){
						output += "<span class='details'>"+ cards[i].transactions[n].type + " " +cards[i].transactions[n].mot +" #" + cards[i].transactions[n].mottid + '<br/>' + formatDate + "</span>";
						}
						else {
						output += "<span class='details'>"+ cards[i].transactions[n].type + " #" + cards[i].transactions[n]._id + '<br/>' + formatDate + "</span>";
						}
						output += "</div>";
						output += "<div class='transaction-item_amount'><span style='margin-right:10px;'>₹</span><p class='amount'>"+ cards[i].transactions[n].amount +"</p></div>";
						output += "</div>";
						//for transaction length add amounts to total 
						if((cards[i].transactions[n].name).toLowerCase() === 'initial deposit'){
						total += 0;
						}
						else{
						total += parseFloat(cards[i].transactions[n].amount);
						}
					}
					document.querySelector('.transactions').innerHTML = output;
					document.querySelector('.total-balance').innerHTML = total.toFixed(2); //2 decimal places
				} 
			}
		}

		//Grab cardList
		var cardsList = document.querySelectorAll('.credit-card');
		//Grab activeCard
		var activeCard = document.querySelector('.credit-card.active');
		//Grab transaction
		var transaction = document.querySelector('.transactions');

		//Show transactions
		showTransactions(cardsList, activeCard);

		//add class show to transaction div for animation
		transaction.classList.add('show')

		//Toggle Active class on Cards and show class on transactions
		for(let i = 0; i < cardsList.length; i++) {
			cardsList[i].addEventListener("click", function(e) {
				e.preventDefault();
				for(let n = 0; n < cardsList.length; n++) {
					if(cardsList[n].classList.contains('active')) {
						cardsList[n].classList.remove('active');
					}
				}
				this.classList.add('active');
				showTransactions(cardsList, this);

				transaction.classList.remove("show");
				//triggering reflow
				void transaction.offsetWidth;

				transaction.classList.add("show");		
		});
		}

		var modal = document.querySelector('.modal');
		//click anywhere to close example modal
		modal.addEventListener('click', function() {
			document.querySelector('.modal').classList.remove('open');
		}, false);
	}
	
	getTransactionDetails = (propsRec) => {
		Axios.get('/api/users/getTransaction/'+propsRec.user.id).then(
			res => {
				this.setState({
				})
			}
		)
	}

	payout = (user) => {
		Swal.fire({
            title: "Please Wait...",
            allowOutsideClick: false
		})
		Swal.showLoading();
		var userid = user.id;
		Axios.get('/api/users/reqPayout/'+userid).then(
			res => {
				Swal.close();
				if(res.data===true){
					Swal.fire(
						'Request Sent Successfully!!',
						'Request sent for approval',
						'success'
					)
				}
				else{
					Swal.fire(
						'Request Failed!!',
						'Please Try again!.',
						'error'
					)
				}
			}
		)
	}

    render() {
        const { user } = this.props.auth;
        return (
            <div className="page-wrapper chiller-theme toggled">
            <Sidebar user={user} />
			<main className="page-content">
			<div className="container-fluid">
			<div className="walletPage">
            <div className="wrapper">
                <div className="app-wrapper">
                <aside className="wallet">
                    <h2>My Wallet</h2>
                    <div className="cards"></div>
                </aside>

                <content className="transactions-wrapper">
                    <h2>
                    Current Balance
                    <span className="total-balance"></span>
                    </h2>
					{this.state.redeem === true && (<div className="redeem"><button type="button" class="btn btn-info" onClick={() => this.payout(user)}>Request for Payout</button></div>)}
                    <div className="transactions"></div>
                </content>

                </div>

            </div>
            <div className="modal">
                <div className="modal-body">
                <h3>Add New Card</h3>
                <div className="modal-close">+</div>
                <div className="card-list">
                    <div className="card-image visa"></div>
                    <div className="card-image amex"></div>
                    <div className="card-image mc"></div>
                </div>
                </div>
            </div>
			</div>
			</div>
			</main>
            </div>
        )
    }
}

wallet.propTypes = {
    auth: PropTypes.object.isRequired
  };
  const mapStateToProps = state => ({
    auth: state.auth
  });
  export default connect(
    mapStateToProps,
    { }
  )(wallet);