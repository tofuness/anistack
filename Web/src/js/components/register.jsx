/** @jsx React.DOM */

var registerForm = React.createClass({
	render: function(){
		return (
			<form id="register-form" className="logreg-form">
				<div className="logreg-section-wrap">
					<div id="logreg-form-hd">
						Let's this get started.
					</div>
					<div id="logreg-form-desc">
						We don't need your e-mail. However, if you forget your credentials you will be shit out of luck.
					</div>
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Username <div className="logreg-legend-desc">Required</div></div>
					<input className="logreg-input" type="text" name="username" /> 
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Password <div className="logreg-legend-desc">Required (at least 6 chars. long)</div></div>
					<input className="logreg-input" type="password" name="password" /> 
				</div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">E-mail <div className="logreg-legend-desc">Optional</div></div>
					<input className="logreg-input" type="password" name="password" /> 
				</div>
				<div className="logreg-section-wrap">
					<div id="logreg-submit">Create My Account</div>
				</div>
				<div className="logreg-section-wrap">
					<a className="logreg-link" href="/login">Already registered?</a>
				</div>
			</form>
		)
	}
});

React.renderComponent(<registerForm />, document.getElementById('register-form-wrap'));