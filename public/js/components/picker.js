/** @jsx React.DOM */

var pickerComp = React.createClass({

	// Status -> Progress -> Rating
	getInitialState: function(){
		var app = {
			itemStatus: '',
			itemRating: '',
			itemProgress: ''
		}
		return app;
	},
	propTypes: {
		pickerType: React.PropTypes.string
	},
	render: function(){
		return (
			<div className="picker-wrap">
				<div className="picker-content">
					<div className="picker-step">
						<div className="picker-status">
							<div className="picker-status-item">
								Current
							</div>
							<div className="picker-status-item">
								Completed
							</div>
							<div className="picker-status-item">
								Planned
							</div>
							<div className="picker-status-item">
								On Hold
							</div>
							<div className="picker-status-item">
								Dropped
							</div>
						</div>
					</div>
					<div className="picker-step">
						<div className="picker-title">
							Your rating
						</div>
						<div className="picker-rating">
							<div className="picker-heart icon-heart-full">
							</div>
							<div className="picker-heart icon-heart-full">
							</div>
							<div className="picker-heart icon-heart-half">
							</div>
							<div className="picker-heart icon-heart-empty">
							</div>
							<div className="picker-heart icon-heart-empty">
							</div>
						</div>
					</div>
					<div className="picker-step">
						<div className="picker-title">
							Progress
						</div>
						<div className="picker-progress">
							<input className="picker-progress-input" placeholder="..." />
							<div className="picker-progress-total">
								24
							</div>
						</div>
					</div>
				</div>
				<div className="picker-bottom">
					<div className="picker-skip">
						Skip &raquo;
					</div>
				</div>
			</div>
		)
	}
});

React.renderComponent(<pickerComp pickerType="all" />, document.getElementById('thepicker'));