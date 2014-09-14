/** @jsx React.DOM */

var ReactClassSet = React.addons.classSet;
var pickerComp = React.createClass({displayName: 'pickerComp',
	propTypes: {
		visible: React.PropTypes.bool,
		itemData: React.PropTypes.object,
		pickerType: React.PropTypes.string
	},
	// Status -> Progress -> Rating
	getInitialState: function(){
		var app = {
			pickerStep: 1,
			pickerRating: '', // What gets displayed
			itemStatus: '',
			itemRating: '',
			itemProgress: ''
		}
		return app;
	},
	componentDidMount: function(){
		var progInput = this.refs.progInput.getDOMNode();
		$(progInput).on('mousewheel', function(e, delta){
			this.setProgress(null, Number(this.state.itemProgress) + delta);
			return false;
		}.bind(this));
	},
	componentWillReceiveProps: function(nextProps){
		if(this.props.visible && !nextProps.visible){
			setTimeout(function(){
				this.replaceState(this.getInitialState());
			}.bind(this), 150);
		}
	},
	forward: function(){
		if(this.state.pickerStep === 3) return this.finish();
		var nextStep = this.state.pickerStep + 1;
		this.goto(nextStep);
	},
	goto: function(gotoStep){
		this.setState({
			pickerStep: gotoStep
		});
		if(gotoStep === 2){
			// Must wait for animation to finish before we actually focus the input...?
			setTimeout(function(){
				this.refs.progInput.getDOMNode().focus();
			}.bind(this), 151);			
		}
	},
	finish: function(){
		console.log(this.state);
		this.props.finish();
	},
	setStatus: function(status){
		if([1, 3, 4, 5].indexOf(status) > -1){
			this.setState({
				itemStatus: status
			});

			// In order to avoid people going back and worth trying to break things

			if(this.state.itemProgress === this.props.itemData.seriesTotal){
				this.setState({
					itemProgress: ''
				});
			}

			this.forward();
		} else if(status === 2){
			this.setState({
				itemStatus: status,
				itemProgress: this.props.itemData.seriesTotal,
			});
			this.goto(3);
		}
	},
	setProgress: function(e, progressValue){
		var inputValue = (!isNaN(progressValue)) ? progressValue : Number(e.target.value);
		if(e && e.key === 'Enter'){
			this.forward();
		} else if(!isNaN(inputValue)){
			if(inputValue < this.props.itemData.seriesTotal && inputValue >= 0){
				this.setState({
					itemProgress: inputValue
				});

				if(this.state.itemStatus === 2){
					this.setState({
						itemStatus: 1
					});
				}
			} else if(inputValue === this.props.itemData.seriesTotal){
				this.setState({
					itemStatus: 2,
					itemProgress: this.props.itemData.seriesTotal
				});
				this.forward();
			}
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
		var heartNodes = [];
		for(var i = 1; i <= 9; i += 2){
			heartNodes.push(
				React.DOM.div({
					className: 
						ReactClassSet({
							'picker-heart': true,
							'icon-heart-empty': true,
							'icon-heart-half': (this.state.pickerRating === i),
							'icon-heart-full': (this.state.pickerRating >= i + 1)
						}), 
					
					onMouseMove: this.previewRating.bind(this, i), 
					onMouseOut: this.resetPreview, 
					onClick: this.setRating
				}
				)
			)
		}

		return (
			React.DOM.div({className: 
				ReactClassSet({
					'picker-wrap': true,
					'visible': this.props.visible
				})
			}, 
				React.DOM.div({className: 
					ReactClassSet({
						'picker-content-wrap': true,
						'step-1': (this.state.pickerStep === 1),
						'step-2': (this.state.pickerStep === 2),
						'step-3': (this.state.pickerStep === 3)
					})
				}, 
					React.DOM.div({className: 
						ReactClassSet({
							'picker-content': true,
							'step-1': (this.state.pickerStep === 1),
							'step-2': (this.state.pickerStep === 2),
							'step-3': (this.state.pickerStep === 3)
						})
					}, 
						React.DOM.div({className: "picker-step"}, 
							React.DOM.div({className: "picker-status"}, 
								React.DOM.div({className: "picker-status-item", onClick: this.setStatus.bind(this, 1)}, 
									"Current"
								), 
								React.DOM.div({className: "picker-status-item", onClick: this.setStatus.bind(this, 2)}, 
									"Completed"
								), 
								React.DOM.div({className: "picker-status-item", onClick: this.setStatus.bind(this, 3)}, 
									"Planned"
								), 
								React.DOM.div({className: "picker-status-item", onClick: this.setStatus.bind(this, 4)}, 
									"On Hold"
								), 
								React.DOM.div({className: "picker-status-item", onClick: this.setStatus.bind(this, 5)}, 
									"Dropped"
								)
							)
						), 
						React.DOM.div({className: "picker-step"}, 
							React.DOM.div({className: "picker-title"}, 
								"Progress"
							), 
							React.DOM.div({className: "picker-progress"}, 
								React.DOM.input({
									ref: "progInput", 
									className: "picker-progress-input", 
									placeholder: "000", 
									maxLength: "3", 
									value: this.state.itemProgress, 
									onChange: this.setProgress, 
									onKeyDown: this.setProgress}
								), 
								React.DOM.div({className: "picker-progress-sep"}, "of"), 
								React.DOM.div({className: "picker-progress-total"}, 
									this.props.itemData.seriesTotal
								)
							)
						), 
						React.DOM.div({className: "picker-step"}, 
							React.DOM.div({className: "picker-title"}, 
								"Rating"
							), 
							React.DOM.div({className: "picker-rating"}, 
								heartNodes, 
								React.DOM.div({className: "picker-rating-number"}, 
									(this.state.itemRating / 2).toFixed(1)
								)
							)
						)
					), 
					React.DOM.div({className: 
						ReactClassSet({
							'picker-bottom': true,
							'visible': (this.state.pickerStep > 1)
						})
					}, 
						React.DOM.div({className: "picker-bullet-wrap"}, 
							React.DOM.div({title: "Go to status", className: 
								ReactClassSet({
									'picker-bullet': true,
									'active': (this.state.pickerStep === 1)
								}), 
							onClick: this.goto.bind(this, 1)}
							), 
							React.DOM.div({title: "Go to progress", className: 
								ReactClassSet({
									'picker-bullet': true,
									'active': (this.state.pickerStep === 2)
								}), 
							onClick: this.goto.bind(this, 2)}
							), 
							React.DOM.div({title: "Go to rating", className: 
								ReactClassSet({
									'picker-bullet': true,
									'active': (this.state.pickerStep === 3)
								}), 
							onClick: this.goto.bind(this, 3)}
							)
						), 
						React.DOM.div({className: "picker-skip", onClick: this.forward}, 
							
								(this.state.pickerStep === 3) ? 'Finish' : 'Next \u00bb'
							
						)
					)
				)
			)
		)
	}
});