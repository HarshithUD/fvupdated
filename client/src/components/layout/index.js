import React, { Component } from 'react';
import './index.css';
import './slider.css';
import './fontAwesome.css';
import Logoimg from './images/logo.png'
import aboutImg from "./images/about.jpg"
import st11 from "./images/st11.png"
import ContactForm from './contact'
import Axios from 'axios';
import Swal from 'sweetalert2';
var fileDownload = require('js-file-download');

export default class index extends Component {
    componentDidMount(){
        document.body.style.backgroundColor = "none !important";
	}
	
	downloadApkFile = (e) => {
		e.preventDefault();
		Axios({
			url: '/api/users/download',
			method: 'GET',
			responseType: 'blob', // important
		  }).then((response) => {
			const url = window.URL.createObjectURL(new Blob([response.data]));
			const link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', 'fortuneVision.apk');
			document.body.appendChild(link);
			link.click();
		  });
	}
    render() {
        return (
            <React.Fragment>
<header>
	<div class="container">
		<nav class="py-3 d-lg-flex">
			<div id="logo">
				<h1> <a href="/"><img src={Logoimg} alt="" sizes="" srcset="" style={{width:'200px'}} /></a></h1>
			</div>
			<label for="drop" class="toggle"><span class="fa fa-bars"></span></label>
			<input type="checkbox" id="drop" />
			<ul class="menu ml-auto mt-1" style={{height: '100%',transform: 'translate(0,50%)'}}>
				<li class="active"><a href="index.html">Home</a></li>
				<li class=""><a href="#about">About Us</a></li>
				<li class=""><a href="#services">Business Plan</a></li>
				{/* <!-- <li class=""><a href="#portfolio">Portfolio</a></li> --> */}
				<li class=""><a href="#contact">Contact</a></li>
				<li class="last-grid"><a href="/signup" style={{fontWeight:'700'}}>Register now</a></li>
			</ul>
		</nav>
	</div>
</header>

<div class="banner" id="home">
	<div class="layer">
		<div class="container">
			<div class="banner-text-w3pvt">
				<div class="csslider infinity" id="slider1">
					<input type="radio" name="slides" checked="checked" id="slides_1" />
					<input type="radio" name="slides" id="slides_2" />
					<input type="radio" name="slides" id="slides_3" />
					<ul class="banner_slide_bg">
						<li>
							<div class="w3ls_banner_txt">
				
								<h3 class="b-w3ltxt text-capitalize mt-md-4">The best platform to grow your network & networth.</h3>
			
								<a href="/signup" class="btn btn-banner my-sm-3 mr-2" style={{fontWeight:'700'}}>Register</a>
								
							</div>
						</li>
					</ul>
					{/* <!-- <div class="navigation">
						<div>
							<label for="slides_1"></label>
							<label for="slides_2"></label>
							<label for="slides_3"></label>
						</div>
					</div> --> */}
				</div>
				{/* <!-- //banner slider--> */}
			</div>
		</div>
	</div>
</div>
{/* <!-- //banner -->
<!-- about --> */}
<section class="services py-5" id="services">
	<div class="container py-md-5 py-3">
	  <h5 class="heading mb-2">Fortune Vision</h5>
		<h3 class="heading  mb-5">The only plan you need</h3>
		<div class="feature-grids row">
			<div class="col-lg-4 col-md-6 col-sm-6 mb-5">
				<div class="bottom-gd">
					<span>01</span>
					{/* <!-- <h3 class="mt-4">Content Marketing </h3> --> */}
					<p class="mt-2">Binary MLM Plan is the most exciting Plan among all types of MLM pay plans because of much more payouts.</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 mb-5">
				<div class="bottom-gd">
					<span>02</span>
					{/* <!-- <h3 class="mt-4"> Distribution Content</h3> --> */}
					<p class="mt-2">Binary Plan is a MLM Plan which pays to infinite downline. That means that a member will be paid by downline, even if the downline are 3 level deep in your structure.</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 mb-5">
				<div class="bottom-gd">
					<span>03</span>
					{/* <!-- <h3 class="mt-4"> Measurement Content</h3> --> */}
					<p class="mt-2">With a binary model, your upline will place their new members under you into what's called your power leg. This is referred to as spillover. Your power leg will usually grow quite quickly.</p>
				</div>
			</div>
		
			<div class="col-lg-4 col-md-6 col-sm-6 mb-5">
				<div class="bottom-gd">
					<span>04</span>
					{/* <!-- <h3 class="mt-4">Editorial Content</h3> --> */}
					<p class="mt-2">Binary plan is great plan for nurturing teamwork in a MLM organization. It plays an important role for you and your downline success. This builds a team unity and cooperative nature of the members.</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6  mb-5">
				<div class="bottom-gd">
					<span>05</span>
					{/* <!-- <h3 class="mt-4"> Creative Content</h3> --> */}
					<p class="mt-2">Binary plan offers the greatest potential generational earnings depth of any of the four basic compensation plans in network marketing.</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 mb-5">
				<div class="bottom-gd">
					<span>06</span>
					{/* <!-- <h3 class="mt-4"> Analytics Content</h3> --> */}
					<p class="mt-2">You really only need to concentrate on building one leg of your business- your "Money Leg". The other leg of your downline matrix or "Power Leg" is usually being built by those in your organization that are above you, and more experienced than you.</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 mb-5">
				<div class="bottom-gd">
					<span>07</span>
					{/* <!-- <h3 class="mt-4"> Analytics Content</h3> --> */}
					<p class="mt-2">The initial Binary Compensation Plan is much easier to understand and maintain qualifications for than other plans created before its' inception.</p>
				</div>
			</div>
			<div class="col-lg-4 col-md-6 col-sm-6 mb-5">
				<div class="bottom-gd">
					<span>08</span>
					{/* <!-- <h3 class="mt-4"> Analytics Content</h3> --> */}
					<p class="mt-2">Binary MLM Compensation Plans help the average and even more than average network marketers to be able to achieve success, and realize the potential for financial freedom.</p>
				</div>
			</div>
			</div>
	</div>
</section>
{/* <!-- //about -->
<!-- about bottom --> */}
<section class="about-bottom py-5" id="about">
	<div class="container py-md-5 py-3">
	<h5 class="heading mb-2">How we work</h5>
		<h3 class="heading mb-sm-5 mb-3">HOw we deal about business</h3>
		<div class="row h-100 justify-content-center align-items-center"> 
			<div class="col-lg-6 left-img">
				<img src={aboutImg} class="img-fluid" alt="" />
			</div> 
			<div class="col-lg-6 mt-lg-0 mt-4">
				<div class="row inner-heading">
					<div class="col-md-2">
						<span class="fa fa-bullseye"></span>
					</div>
					<div class="col-md-10">
						<h4 class="mt-md-0 mt-2">We work fast</h4>
						<p class="mt-3">FutureVision  is a concern directed by professionals with lots of knowledge & experience in Business Industry on their credit. It is this knowledge and experience that they wanted to forward to the community on the whole. Keeping this idea in mind, with great vision and leadership qualities, they have started www.FutureVision.in for you and to be with you always.</p>
					</div>
				</div>
			</div>
		</div>
			<div class="row mt-5"> 
			<div class="col-lg-6 mt-lg-0 mt-4">
				<div class="row inner-heading h-100 justify-content-center align-items-center">
					<div class="col-md-2">
						<span class="fa fa-question-circle"></span>
					</div>
					<div class="col-md-10">
						<h4 class="mt-md-0 mt-2">Further support</h4>
						<p class="mt-3">For More details, you may call us at 99999-99999. Our support team will feel happy to help you at every stage.</p>
					</div>
				</div>
			</div>
			<div class="col-lg-6 left-img">
				<img src={st11} class="img-fluid" alt="" />
			</div> 
		</div>
	</div>
</section>
{/* <!-- //about bottom -->
<!-- team -->
<!-- <section class="team py-5" id="team">
	<div class="container py-md-5 py-3">
		<div class="title-desc text-center">
			<h5 class="heading heading1 mb-2"> Our Team</h5>
		<h3 class="heading heading1 mb-sm-5 mb-3">Our Expert Minds</h3>
		</div>
		<div class="row team-grid">
			<div class="col-lg-3 col-sm-6 mb-4">
				<div class="box13">
					<img src="./images/team1.jpg" class="img-fluid img-thumbnail" alt="" />
					<div class="box-content">
						<h3 class="title">robert</h3>
						<span class="post">business planer</span>
						<ul class="social">
							<li><a href="#"><span class="fa fa-facebook"></span></a></li>
							<li><a href="#"><span class="fa fa-twitter"></span></a></li>
						</ul>
					</div>
				</div>
			</div>
			<div class="col-lg-3 col-sm-6 mb-4">
				<div class="box13">
					<img src="./images/team2.jpg" class="img-fluid img-thumbnail" alt="" />
					<div class="box-content">
						<h3 class="title">pollard</h3>
						<span class="post">business dealer</span>
						<ul class="social">
							<li><a href="#"><span class="fa fa-facebook"></span></a></li>
							<li><a href="#"><span class="fa fa-twitter"></span></a></li>
						</ul>
					</div>
				</div>
			</div>
			<div class="col-lg-3 col-sm-6 mb-4">
				<div class="box13">
					<img src="./images/team3.jpg" class="img-fluid img-thumbnail" alt="" />
					<div class="box-content">
						<h3 class="title">billings</h3>
						<span class="post">business manager</span>
						<ul class="social">
							<li><a href="#"><span class="fa fa-facebook"></span></a></li>
							<li><a href="#"><span class="fa fa-twitter"></span></a></li>
						</ul>
					</div>
				</div>
			</div>
			<div class="col-lg-3 col-sm-6 mb-4">
				<div class="box13">
					<img src="./images/team4.jpg" class="img-fluid img-thumbnail" alt="" />
					<div class="box-content">
						<h3 class="title">bravo</h3>
						<span class="post">sales manager</span>
						<ul class="social">
							<li><a href="#"><span class="fa fa-facebook"></span></a></li>
							<li><a href="#"><span class="fa fa-twitter"></span></a></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</section> -->
<!-- //team -->

<!-- portfolio -->
<!-- <section class="portfolio py-5" id="portfolio">
	<div class="container py-md-5 py-3">
	<h5 class="heading mb-2">our recent works</h5>
		<h3 class="heading mb-sm-5 mb-3">Our Portfolio</h3>
		<div class="row news-grids text-center">
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal1"><img src="./images/g1.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal2"><img src="./images/g2.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal3"><img src="./images/g3.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal4"><img src="./images/g4.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal5"><img src="./images/g5.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal6"><img src="./images/g6.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal7"><img src="./images/g7.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
			<div class="col-md-3 col-6 gal-img">
				<a href="#gal8"><img src="./images/g8.jpg" alt="portfolio image" class="img-fluid"></a>
			</div>
		</div>
		portfolio popups
	-->
			<!-- popup--> */}
			{/* <!-- <div id="gal1" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g1.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> --> */}
			{/* <!-- //popup -->
			<!-- popup-->
			<!-- <div id="gal2" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g2.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> --> */}
			{/* <!-- //popup -->
			<!-- popup--> */}
			{/* <!-- <div id="gal3" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g3.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> --> */}
			{/* <!-- //popup3 -->
			<!-- popup--> */}
			{/* <!-- <div id="gal4" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g4.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> --> */}
			{/* <!-- //popup -->
			<!-- popup--> */}
			{/* <!-- <div id="gal5" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g5.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> --> */}
			{/* <!-- //popup -->
			<!-- popup--> */}
			{/* <!-- <div id="gal6" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g6.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> --> */}
			{/* <!-- //popup -->
			<!-- popup-->
			<!-- <div id="gal7" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g7.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> --> */}
			{/* <!-- //popup -->
			<!-- popup-->
			<!-- <div id="gal8" class="pop-overlay animate">
				<div class="popup">
					<img src="./images/g8.jpg" alt="Popup Image" class="img-fluid" />
					<p class="mt-4">Nulla viverra pharetra se, eget pulvinar neque pharetra ac int. placerat placerat dolor.</p>
					<a class="close" href="#portfolio">&times;</a>
				</div>
			</div> -->
			<!-- //popup -->
			<!-- //portfolio popups --> */}
	{/* <!-- </div> */}
{/* </section> --> */}
{/* <!-- //Projects -->
<!-- /plans --> */}
    {/* <!-- <section class="plans-sec py-5" id="plans">
        <div class="container py-md-5 py-3">
		<h5 class="heading mb-2"> Exclusive prices</h5>
		<h3 class="heading mb-sm-5 mb-3">We Provide Best price</h3>
                    <div class="row pricing-plans">
                        <div class="col-md-4 price-main text-center mb-4">
                            <div class="pricing-grid card">
                                <div class="card-body">
                                    <span class="fa fa-user-o" aria-hidden="true"></span>
                                    <h4 class="text-uppercase">Basic</h4>
                                    <h5 class="card-title pricing-card-title">
                                        <span class="align-top">$</span>199

                                    </h5>
                                   <p>We help you to grow up your business and solution for your impressive projects.</p>
                                    <div class="price-button mt-md-3 mt-2">
                                        <a class="btn text-uppercase" href="#contact">
                                            Read More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 price-main price-main1  text-center mb-4">
                            <div class="pricing-grid card">
                                <div class="card-body">
                                    <span class="fa fa-female" aria-hidden="true"></span>
                                    <h4 class="text-uppercase">Standard</h4>
                                    <h5 class="card-title pricing-card-title">
                                        <span class="align-top">$</span>199

                                    </h5>
                                    <p>We help you to grow up your business and solution for your impressive projects.</p>
                                    <div class="price-button mt-md-3 mt-2">
                                        <a class="btn text-uppercase" href="#contact">
                                            Read More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
						<div class="col-md-4 price-main text-center mb-4">
                            <div class="pricing-grid card">
                                <div class="card-body">
                                    <span class="fa fa-file-video-o" aria-hidden="true"></span>
                                    <h4 class="text-uppercase">Premium</h4>
                                    <h5 class="card-title pricing-card-title">
                                        <span class="align-top">$</span>399

                                    </h5>
                                   <p>We help you to grow up your business and solution for your impressive projects.</p>
                                    <div class="price-button mt-md-3 mt-2">
                                        <a class="btn text-uppercase" href="#contact">
                                            Read More</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        </div>
    </section> --> */}
    {/* <!-- //plans -->

<!-- text --> */}
{/* <!-- <section class="text py-5" id="register">
	<div class="container py-md-5 py-3 text-center">		
		<div class="row">
			<div class="col-12">
				<h2 class="mb-4 heading">The Best Business <span>company</span>.</h2>
				<p>Sed ut perspiciatis unde omnis natus error dolor volup tatem ed accus antium dolor emque
				laudantium, totam rem aperiam, eaqu ipsa quae ab illo quasi architi ecto beatae vitae dicta
				sunt dolor ipsum.</p>
				<a href="#contact" class="btn mr-3"> Work With Us</a>
				<a href="#portfolio" class="btn"> Projects </a>
			</div>	
					<div class="col-md-6 padding"> -->
							<!-- banner form -->
							<!-- <form action="#" method="post">
								<h5 class="mb-3">Register Here</h5> 
								<div class="form-style-w3ls">
									<input placeholder="Your Name" name="name" type="text" required="">
									<input placeholder="Your Email Id" name="email" type="email" required="">
									<input placeholder="Contact Number" name="number" type="text" required="">
									<select>
									  <option value="0">Business Type</option>
									  <option value="1">Corporate</option>
									  <option value="1">Partnership</option>
									  <option value="1">Other</option>
									</select> -->
									<!--<input placeholder="Password" name="password" type="password" required=""> -->
									<!-- <button Class="btn"> Get registered</button>
									<span>By registering, you agree to our <a href="#">Terms & Conditions.</a></span>
								</div>
							</form> -->
							<!-- //banner form -->
			<!-- </div>			
		</div>
	</div>		
</section> -->
<!-- //text -->
<!-- testimonials -->
<!-- <section class="testi py-5" id="testi">
	<div class="container py-md-5 py-3">
			<h5 class="heading mb-2">Testimonial</h5>
		<h3 class="heading mb-sm-5 mb-3">What Our Client Say</h3>
		<div class="row">
			<div class="col-lg-6 mb-4">
				<div class="row testi-cgrid border-right-grid">
					<div class="col-sm-4 testi-icon mb-sm-0 mb-3">
						<img src="./images/test1.jpg" alt="" class="img-fluid"/>
					</div>
					<div class="col-sm-8">
						<p class="mx-auto"><span class="fa fa-quote-left"></span> Onec consequat sapien utleo dolor rhoncus. Nullam dui mi, vulputater act metus semper. Vestibulum sed dolor.</p>
						<h6 class="b-w3ltxt mt-3">Johnson - <span>customer</span></h6>
					</div>
				</div>
			</div>
			<div class="col-lg-6 mb-4">
				<div class="row testi-cgrid border-left-grid">
					<div class="col-sm-4 testi-icon mb-sm-0 mb-3">
						<img src="./images/test2.jpg" alt="" class="img-fluid"/>
					</div>
					<div class="col-sm-8">
						<p class="mx-auto"><span class="fa fa-quote-left"></span> Onec consequat sapien utleo dolor rhoncus. Nullam dui mi, vulputater act metus semper. Vestibulum sed dolor.</p>
						<h6 class="b-w3ltxt mt-3">walkner - <span>customer</span></h6>
					</div>
				</div>
			</div>
		</div>
	</div>
</section> --> */}
{/* <!-- testimonials -->
<!-- Contact page --> */}
<section class="contact py-5" id="contact">
	<div class="container py-md-5 py-5">
	<h5 class="heading mb-2">Contact Us</h5>
		<div class="row contact_information h-100 align-items-center justify-content-center">
			<div class="col-md-6 contact_left">
				<div class="contact_border p-4">
					<h3 class="heading mb-sm-5 mb-3">BUSINESS GROWTH CONTACT US</h3>
					<p class="text-center">Helpline Number : <a href="tel:1"> 99999-99999</a></p>
					<p style={{margin:'3em 0',textAlign:'center',cursor:'pointer'}}><span onClick={this.downloadApkFile}><img src={require('./images/download.png')} style={{width:'225px'}}/></span></p>
				</div>
			</div>
			<div class="col-md-6 mt-md-0 mt-4">
				<ContactForm />
			</div>
		</div>
	</div>
</section>
{/* <!-- //Contact page -->

<!-- footer --> */}
<footer class="py-md-5 py-3">
	<div class="container py-md-5 py-3">
		<div class="row footer-grids">
			<div class="col-lg-3 col-sm-6 mb-lg-0 mb-sm-5 mb-4">
				<h4 class="mb-4"><img src={Logoimg} alt="" sizes="" srcset="" style={{width:'200px'}} /></h4>
				{/* <!-- <p class="mb-3"></p> --> */}
				
			</div>
			<div class="col-lg-3 col-sm-6 mb-md-0 mb-sm-5 mb-4">
				<h4 class="mb-4">Address Info</h4>
				{/* <!-- <p><span class="fa mr-2 fa-map-marker"></span></span></p> --> */}
				<p class="phone py-2"><span class="fa mr-2 fa-phone"></span> +1(12) 123 456 789 </p>
				<p><span class="fa mr-2 fa-envelope"></span><a href="mailto:info@example.com">info@example.com</a></p>
			</div>
			<div class="col-lg-2 col-sm-6 mb-lg-0 mb-sm-5 mb-4">
				<h4 class="mb-4">Quick Links</h4>
				<ul>
					<li><a href="#register">Register here </a></li>
					<li class="my-2"><a href="#services">Business Plan</a></li>
					<li><a href="#about">About</a></li>
					<li class="mt-2"><a href="#contact">Contact</a></li>
				</ul>
			</div>
			{/* <!-- <div class="col-lg-4 col-sm-6">
				<h4 class="mb-4">Subscribe Us</h4>
				<p class="mb-3">Subscribe to our newsletter</p>
				<form action="#" method="post" class="d-flex">
					<input type="email" id="email" name="EMAIL" placeholder="Enter your email here" required="">
					<button type="submit" class="btn">Subscribe</button>
				</form>
			</div> -->
		</div> */}
	</div>
    </div>
</footer>
{/* <!-- //footer --> */}

{/* <!-- copyright --> */}
<div class="copyright">
	<div class="container py-4">
		<div class=" text-center">
			<p>© 2019 Fortune Vision.</p>
		</div>
	</div>
</div>
{/* <!-- //copyright -->
		
<!-- move top --> */}
<div class="move-top text-right">
	<a href="#home" class="move-top"> 
		<span class="fa fa-angle-up  mb-3" aria-hidden="true"></span>
	</a>
</div>
            </React.Fragment>
        )
    }
}
