var RegisterForm = React.createClass({
	getInitialState: function(){
		return {
			usernameVal: '',
			usernameValid: null,
			passwordVal: '',
			emailVal: '',
			emailValid: null
		}
	},
	usernameChange: function(e){
		e.persist();
		this.setState({
			usernameVal: e.target.value.replace(/\W+/g, ''),
			usernameValid: (e.target.value.trim() !== '' && e.target.value.length >= 3 && e.target.value.length <= 40) ? 'loading' : (e.target.value.trim() !== '') ? false : null
		});
		if(e.target.value.length >= 3) this.validateUsername(e);
	},
	passwordChange: function(e){
		this.setState({
			passwordVal: e.target.value
		});
	},
	emailChange: function(e){
		e.persist();
		this.setState({
			emailVal: e.target.value.trim(),
			emailValid: (e.target.value.trim() !== '' ) ? 'loading' : null
		});
		this.validateEmail(e);
	},
	registerAccount: function(){
		if(this.state.emailValid !== false && this.state.usernameValid !== false && this.state.passwordVal.length >= 6 && this.state.usernameVal.length >= 3){
			$.ajax({
				type: 'post',
				url: '/api/register',
				data: $(this.refs.registerForm.getDOMNode()).serialize() + '&_csrf=' + UserConstants.CSRF_TOKEN,
				success: function(res){
					console.log(res);
				},
				error: function(err){
					console.log(err);
				}
			});
		} else {
			alert('check the damn form');
		}		
	},
	validateUsername: _.debounce(function(e){
		if(e.target.value === '') return this.setState({ usernameValid: null });
		$.ajax({
			type: 'post',
			url: '/api/validate/username',
			data: {
				_csrf: UserConstants.CSRF_TOKEN,
				username: e.target.value
			},
			success: function(res){
				console.log(res);
				this.setState({
					usernameValid: res.is_valid === true && res.exists === false
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 500),
	validateEmail: _.debounce(function(e){
		if(e.target.value === '') return this.setState({ emailValid: null });
		$.ajax({
			type: 'post',
			url: '/api/validate/email',
			data: {
				_csrf: UserConstants.CSRF_TOKEN,
				email: e.target.value
			},
			success: function(res){
				console.log(res);
				this.setState({
					emailValid: res.is_valid === true && res.exists === false
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 500),
	render: function(){
		return (
			<form id="register-form" className="logreg-form" ref="registerForm">
				<div className="logreg-section-wrap">
					<div id="logreg-form-hd">
						Let's get this started.
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Username <div className="logreg-legend-desc">At least <b>3</b> chars. Only letters/numbers.</div></div>
					<input className="logreg-input" type="text" name="username" value={this.state.usernameVal} onChange={this.usernameChange} />
					<div className={
						React.addons.classSet({
							'icon-spam': this.state.usernameValid === false,
							'icon-check-thin': this.state.usernameValid === true,
							'icon-ellipsis': this.state.usernameValid === 'loading',
							'logreg-input-validate': true,
							'visible': this.state.usernameValid !== null
						})
					}>
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Password <div className="logreg-legend-desc">At least <b>6</b> chars. Keep this secure.</div></div>
					<input id="logreg-password-input" className="logreg-input" type="password" name="password" value={this.state.passwordVal} onChange={this.passwordChange} /> 
					<div className={
						React.addons.classSet({
							'icon-spam':  0 < this.state.passwordVal.length && this.state.passwordVal.length < 6,
							'icon-check-thin':  this.state.passwordVal.length >= 6,
							'logreg-input-validate': true,
							'visible': this.state.passwordVal
						})
					}>
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Email <div className="logreg-legend-desc"><b>Optional</b>. You can add/remove it later.</div></div>
					<input className="logreg-input" type="text" name="email" value={this.state.emailVal} onChange={this.emailChange} />
					<div className={
						React.addons.classSet({
							'icon-spam': this.state.emailValid === false,
							'icon-check-thin': this.state.emailValid === true,
							'icon-ellipsis': this.state.emailValid === 'loading',
							'logreg-input-validate': true,
							'visible': this.state.emailValid !== null
						})
					}>
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div id="logreg-form-desc">
						Most of Herro's features do not require that you have an email. However, if you forget your login credentials you will be shit out of luck.
						<div className="logreg-form-desc-small">(You may add an email later)</div>
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

module.exports = RegisterForm;