var ForgotForm = React.createClass({
	submitForm: function() {
		$(this.refs.forgotForm.getDOMNode()).submit();
	},
	render: function() {
		return (
			<form id="forgot-form" className="logreg-form" ref="forgotForm" method="post" action="/forgot">
				<div id="logreg-form-logo"></div>
				<div className="logreg-section-wrap">
					<div className="logreg-legend">Email <div className="logreg-legend-desc">Forgot to add an email? RIP.</div></div>
					<input className="logreg-input" type="text" name="email" tabIndex="1" /> 
				</div>
				<div className="logreg-section-wrap">
					<div id="logreg-submit" onClick={this.submitForm}>Request new password</div>
				</div>
				<div className="logreg-section-wrap">
					<a className="logreg-link" href="/register">or Register for Free</a>
				</div>
				<input type="hidden" value={UserConstants.CSRF_TOKEN} name="_csrf" />
			</form>
		)
	}
});

module.exports = ForgotForm;