/** @jsx React.DOM */

var registerForm = React.createClass({
	getInitialState: function(){
		return {
			usernameVal: null,
			passwordVal: null,
			emailVal: null,
			emailValid: null
		}
	},
	usernameChange: function(e){
		this.setState({
			usernameVal: e.target.value.replace(/\W+/g, '')
		});
	},
	passwordChange: function(e){
		this.setState({
			passwordVal: e.target.value
		});
	},
	emailChange: function(e){
		e.persist();
		this.setState({
			emailVal: e.target.value
		});
		this.validateEmail(e);
	},
	registerAccount: function(){
		if(this.state.emailValid && this.state.passwordVal >= 6){
			console.log($(this.refs.registerForm.getDOMNode()).serialize());
		} else {

		}		
	},
	validateEmail: _.debounce(function(e){
		if(e.target.value === '') return this.setState({ emailValid: null });
		$.ajax({
			type: 'post',
			url: 'http://localhost:1339/validate/email',
			data: {
				address: e.target.value
			},
			success: function(res){
				console.log(res);
				this.setState({
					emailValid: res.is_valid === true
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 700),
	render: function(){
		return (
			<form id="register-form" className="logreg-form" ref="registerForm">
				<div className="logreg-section-wrap">
					<div id="logreg-form-hd">
						Let's get this started.
					</div>
					<div id="logreg-form-desc">
						Most of Herro's features do not require that you have an email. However, if you forget your login credentials you will be shit out of luck.
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Username <div className="logreg-legend-desc">At least <b>3</b> chars. Only letters/numbers.</div></div>
					<input className="logreg-input" type="text" name="username" value={this.state.usernameVal} onChange={this.usernameChange} /> 
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Password <div className="logreg-legend-desc">At least <b>6</b> characters. Keep this secure.</div></div>
					<input className="logreg-input" type="password" name="password" value={this.state.passwordVal} onChange={this.passwordChange} /> 
					<div className={
						React.addons.classSet({
							'icon-spam': true,
							'logreg-input-error': true,
							'visible': this.state.passwordVal && this.state.passwordVal.length < 6
						})
					}>
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Email <div className="logreg-legend-desc"><b>Optional</b>. You can add/remove it later.</div></div>
					<input className="logreg-input" type="text" name="email" value={this.state.emailVal} onChange={this.emailChange} />
					<div className={
						React.addons.classSet({
							'icon-spam': true,
							'logreg-input-error': true,
							'visible': this.state.emailValid === false
						})
					}>
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div id="logreg-submit" onClick={this.registerAccount}>Create My Account</div>
				</div>
				<div className="logreg-section-wrap">
					<a className="logreg-link" href="/login">Already registered?</a>
				</div>
			</form>
		)
	}
});

React.renderComponent(<registerForm />, document.getElementById('register-form-wrap'));