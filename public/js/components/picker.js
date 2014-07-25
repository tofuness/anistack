/** @jsx React.DOM */

var ReactClassSet = React.addons.classSet;
var pickerComp = React.createClass({

	// Status -> Progress -> Rating
	getInitialState: function(){
		var app = {
			pickerStep: 3,
			pickerRating: 4, // What gets displayed
			itemStatus: '',
			itemRating: 4,
			itemProgress: '',
			seriesTotal: 24
		}
		return app;
	},
	propTypes: {
		pickerType: React.PropTypes.string
	},
	forward: function(){
		var nextStep = (this.state.pickerStep === 3) ? 1 : this.state.pickerStep + 1;
		this.goto(nextStep);
	},
	skip: function(){

	},
	goto: function(gotoStep){
		this.setState({
			pickerStep: gotoStep
		});
		if(gotoStep === 2){
			// Must wait for animation to finish before we actually focus the input...?
			setTimeout(function(){
				this.refs.progressInput.getDOMNode().focus();
			}.bind(this), 301);			
		}
	},
	setStatus: function(status){
		if([1, 3, 4, 5].indexOf(status) > -1){
			this.setState({
				itemStatus: status
			});

			// In order to avoid people going back and worth, trying to break things

			if(this.state.itemProgress === this.state.seriesTotal){
				this.setState({
					itemProgress: ''
				});
			}

			this.forward();
		} else if(status === 2){
			this.setState({
				itemStatus: status,
				itemProgress: this.state.seriesTotal,
			});
			this.goto(3);
		}
	},
	setProgress: function(e){
		var inputValue = Number(e.target.value);

		if(isNaN(inputValue)) return false;

		if(inputValue < this.state.seriesTotal){1
			this.setState({
				itemProgress: inputValue
			});

			if(this.state.itemStatus === 2){
				this.setState({
					itemStatus: 1
				});
			}
		} else if(inputValue === this.state.seriesTotal){
			this.setState({
				itemStatus: 2,
				itemProgress: this.state.seriesTotal
			});
			this.forward();
		}
	},
	setRating: function(){
		this.setState({
			itemRating: this.state.pickerRating
		});
	},
	previewRating: function(rating, e){
		var posX = e.pageX - $(e.target).offset().left;
		if(rating === 1){
			if(posX < 15){
				this.setState({
					pickerRating: 0
				});
			} else if(posX < 27){
				this.setState({
					pickerRating: Number(rating)
				});
			} else {
				this.setState({
					pickerRating: Number(rating + 1)
				});
			}
		} else {
			if(posX < 12){
				this.setState({
					pickerRating: Number(rating)
				});
			} else {
				this.setState({
					pickerRating: Number(rating + 1)
				});
			}
		}
	},
	resetPreview: function(){
		this.setState({
			pickerRating: this.state.itemRating
		});
	},
	render: function(){
		console.log(this.state);
		return (
			<div className="picker-wrap">
				<div className={
					ReactClassSet({
						'picker-content': true,
						'step-1': (this.state.pickerStep === 1),
						'step-2': (this.state.pickerStep === 2),
						'step-3': (this.state.pickerStep === 3),
					})
				}>
					<div className="picker-step">
						<div className="picker-status">
							<div className="picker-status-item" onClick={this.setStatus.bind(this, 1)}>
								Current
							</div>
							<div className="picker-status-item" onClick={this.setStatus.bind(this, 2)}>
								Completed
							</div>
							<div className="picker-status-item" onClick={this.setStatus.bind(this, 3)}>
								Planned
							</div>
							<div className="picker-status-item" onClick={this.setStatus.bind(this, 4)}>
								On Hold
							</div>
							<div className="picker-status-item" onClick={this.setStatus.bind(this, 5)}>
								Dropped
							</div>
						</div>
					</div>
					<div className="picker-step">
						<div className="picker-title">
							Progress
						</div>
						<div className="picker-progress">
							<input 
								ref="progressInput"
								className="picker-progress-input"
								placeholder="000"
								maxLength="3"
								autoFocus
								value={this.state.itemProgress}
								onChange={this.setProgress}
							/>
							<div className="picker-progress-sep">of</div>
							<div className="picker-progress-total">
								{this.state.seriesTotal}
							</div>
						</div>
					</div>
					<div className="picker-step">
						<div className="picker-title">
							Rating
						</div>
						<div className="picker-rating">
							<div className={
								ReactClassSet({
									'picker-heart': true,
									'icon-heart-empty': true,
									'icon-heart-half': (this.state.pickerRating === 1),
									'icon-heart-full': (this.state.pickerRating >= 2)
								})
							}
							onMouseMove={this.previewRating.bind(this, 1)}
							onMouseOut={this.resetPreview}
							onClick={this.setRating}>
							</div>
							<div className={
								ReactClassSet({
									'picker-heart': true,
									'icon-heart-empty': true,
									'icon-heart-half': (this.state.pickerRating === 3),
									'icon-heart-full': (this.state.pickerRating >= 4)
								})
							}
							onMouseMove={this.previewRating.bind(this, 3)}
							onMouseOut={this.resetPreview}
							onClick={this.setRating}>
							</div>
							<div className={
								ReactClassSet({
									'picker-heart': true,
									'icon-heart-empty': true,
									'icon-heart-half': (this.state.pickerRating === 5),
									'icon-heart-full': (this.state.pickerRating >= 6)
								})
							}
							onMouseMove={this.previewRating.bind(this, 5)}
							onMouseOut={this.resetPreview}
							onClick={this.setRating}>
							</div>
							<div className={
								ReactClassSet({
									'picker-heart': true,
									'icon-heart-empty': true,
									'icon-heart-half': (this.state.pickerRating === 7),
									'icon-heart-full': (this.state.pickerRating >= 8)
								})
							}
							onMouseMove={this.previewRating.bind(this, 7)}
							onMouseOut={this.resetPreview}
							onClick={this.setRating}>
							</div>
							<div className={
								ReactClassSet({
									'picker-heart': true,
									'icon-heart-empty': true,
									'icon-heart-half': (this.state.pickerRating === 9),
									'icon-heart-full': (this.state.pickerRating >= 10)
								})
							}
							onMouseMove={this.previewRating.bind(this, 9)}
							onMouseOut={this.resetPreview}
							onClick={this.setRating}>
							</div>
							<div className="picker-rating-number">
								{(this.state.itemRating / 2).toFixed(1)}
							</div>
						</div>
					</div>
				</div>
				<div className={
					ReactClassSet({
						'picker-bottom': true,
						'show': (this.state.pickerStep > 1)
					})
				}>
					<div className="picker-bullet-wrap">
						<div title="Go to status" className={
							ReactClassSet({
								'picker-bullet': true,
								'active': (this.state.pickerStep === 1)
							})
						} onClick={this.goto.bind(this, 1)}>
						</div>
						<div title="Go to progress" className={
							ReactClassSet({
								'picker-bullet': true,
								'active': (this.state.pickerStep === 2)
							})
						} onClick={this.goto.bind(this, 2)}>
						</div>
						<div title="Go to rating" className={
							ReactClassSet({
								'picker-bullet': true,
								'active': (this.state.pickerStep === 3)
							})
						} onClick={this.goto.bind(this, 3)}>
						</div>
					</div>
					<div className="picker-skip" onClick={this.forward}>
						Next &raquo;
					</div>
				</div>
			</div>
		)
	}
});

React.renderComponent(<pickerComp pickerType="all" />, document.getElementById('thepicker'));