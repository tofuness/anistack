/** @jsx React.DOM */

var registerForm = React.createClass({displayName: 'registerForm',
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
			usernameValid: (e.target.value.trim() !== '' && e.target.value.length >= 3) ? 'loading' : (e.target.value.trim() !== '') ? false : null
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
				data: $(this.refs.registerForm.getDOMNode()).serialize(),
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
			React.DOM.form({id: "register-form", className: "logreg-form", ref: "registerForm"}, 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-form-hd"}, 
						"Let's get this started."
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Username ", React.DOM.div({className: "logreg-legend-desc"}, "At least ", React.DOM.b(null, "3"), " chars. Only letters/numbers.")), 
					React.DOM.input({className: "logreg-input", type: "text", name: "username", value: this.state.usernameVal, onChange: this.usernameChange}), 
					React.DOM.div({className: 
						React.addons.classSet({
							'icon-spam': this.state.usernameValid === false,
							'icon-check': this.state.usernameValid === true,
							'icon-ellipsis': this.state.usernameValid === 'loading',
							'logreg-input-validate': true,
							'visible': this.state.usernameValid !== null
						})
					}
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Password ", React.DOM.div({className: "logreg-legend-desc"}, "At least ", React.DOM.b(null, "6"), " chars. Keep this secure.")), 
					React.DOM.input({id: "logreg-password-input", className: "logreg-input", type: "password", name: "password", value: this.state.passwordVal, onChange: this.passwordChange}), 
					React.DOM.div({className: 
						React.addons.classSet({
							'icon-spam':  0 < this.state.passwordVal.length < 6,
							'icon-check':  this.state.passwordVal.length >= 6,
							'logreg-input-validate': true,
							'visible': this.state.passwordVal
						})
					}
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({className: "logreg-legend"}, "Email ", React.DOM.div({className: "logreg-legend-desc"}, React.DOM.b(null, "Optional"), ". You can add/remove it later.")), 
					React.DOM.input({className: "logreg-input", type: "text", name: "email", value: this.state.emailVal, onChange: this.emailChange}), 
					React.DOM.div({className: 
						React.addons.classSet({
							'icon-spam': this.state.emailValid === false,
							'icon-check': this.state.emailValid === true,
							'icon-ellipsis': this.state.emailValid === 'loading',
							'logreg-input-validate': true,
							'visible': this.state.emailValid !== null
						})
					}
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-form-desc"}, 
						"Most of Herro's features do not require that you have an email. However, if you forget your login credentials you will be shit out of luck."
					)
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.div({id: "logreg-submit", onClick: this.registerAccount}, "Create My Account")
				), 
				React.DOM.div({className: "logreg-section-wrap"}, 
					React.DOM.a({className: "logreg-link", href: "/login"}, "Already registered?")
				)
			)
		)
	}
});

React.renderComponent(registerForm(null), document.getElementById('register-form-wrap'));