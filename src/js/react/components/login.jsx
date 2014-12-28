var LoginForm = React.createClass({
	logIn: function() {
		$(this.refs.loginForm.getDOMNode()).submit();
	},
	ifEnter: function(e) {
		if (e.key === 'Enter') this.logIn();
	},
	render: function() {
		return (
			<form id="login-form" className="logreg-form" ref="loginForm" method="post" action="/login" onKeyUp={this.ifEnter}>
				<div id="logreg-form-logo"></div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Username</div>
					<input className="logreg-input" type="text" name="username" tabIndex="1" /> 
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Password <a className="logreg-legend-link" href="/forgot">Forgot your Password?</a></div>
					<input id="logreg-password-input" className="logreg-input" type="password" name="password" tabIndex="2" /> 
				</div>
				<div className="logreg-section-wrap">
					<div id="logreg-submit" onClick={this.logIn}>Log in</div>
				</div>
				<div className="logreg-section-wrap">
					<a className="logreg-link" href="/register">or Register for Free</a>
				</div>
				<input type="hidden" value={UserConstants.CSRF_TOKEN} name="_csrf" />
			</form>
		)
	}
});

module.exports = LoginForm;