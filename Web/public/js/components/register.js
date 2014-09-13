/** @jsx React.DOM */

var registerForm = React.createClass({displayName: 'registerForm',
	getInitialState: function(){
		return {
			usernameVal: '',
			passwordVal: '',
			emailVal: '',
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
			emailVal: e.target.value.trim(),
			emailValid: (e.target.value.trim() !== '' ) ? 'loading' : ''
		});
		this.validateEmail(e);
	},
	registerAccount: function(){
		if(this.state.emailValid === true && this.state.passwordVal.length >= 6 && this.state.usernameVal.length >= 3){
			console.log($(this.refs.registerForm.getDOMNode()).serialize());
		} else {
			alert('check the damn form');
		}		
	},
	validateEmail: _.debounce(function(e){
		if(e.target.value === '') return this.setState({ emailValid: '' });
		$.ajax({
			type: 'post',
			url: 'http://localhost:1339/validate/email',
			data: {
				address: e.target.value
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
	}, 700),
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
							'icon-spam':  0 < this.state.usernameVal.length < 3,
							'icon-check':  this.state.usernameVal.length >= 3,
							'logreg-input-validate': true,
							'visible': this.state.usernameVal
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