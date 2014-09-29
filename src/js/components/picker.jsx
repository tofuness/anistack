var cx = React.addons.classSet;
var pickerApp = React.createClass({
	propTypes: {
		seriesData: React.PropTypes.object,
		onClose: React.PropTypes.func,
		onSave: React.PropTypes.func
	},
	getInitialState: function(){
		return {
			itemStatusDisplay: 'Current',
			itemStatus: 'current',
			itemProgress: '',
			itemRating: '',
			itemRepeats: '',
			ratingPreview: '',
			statusMenuVisible: false
		}
	},
	componentDidUpdate: function(prevProps, prevState){
		var episodesTotal = this.props.seriesData.series_episodes_total;

		// If statement below is there to make sure no infinite-loop happen

		if(
			(this.state.itemStatus === 'completed') !==
			(this.state.itemProgress === episodesTotal)
		){

			// (1) If changed status to completed: bump up the itemProgress

			if(this.state.itemStatus === 'completed' && prevState.itemStatus !== 'completed'){
				this.setState({
					itemProgress: episodesTotal
				});
			}

			// (2) If changed the status from completed: remove the itemProgress

			if(prevState.itemStatus === 'completed' && this.state.itemStatus !== 'completed'){
				this.setState({
					itemProgress: ''
				});
			}

			// (3) If changed the progress to e.g. 10/10: change the status to completed. Can be combined with (1)

			if(prevState.itemProgress < episodesTotal && this.state.itemProgress === episodesTotal){
				this.setState({
					itemStatusDisplay: 'Completed',
					itemStatus: 'completed'
				});
			}

			// (4) If changed the progress to e.g. 5/10: change the status to current. Can be combined with (3)

			if(prevState.itemProgress === episodesTotal && this.state.itemProgress < episodesTotal){
				this.setState({
					itemStatusDisplay: 'Current',
					itemStatus: 'current'
				});
			}

		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.itemData){
			if(Object.keys(nextProps.itemData).length === 0){
				// Timeout to compensate for scaleout animation duration
				setTimeout(function(){
					this.setState(this.getInitialState());
				}.bind(this), 150);
			} else {
				setTimeout(function(){
					this.setState(nextProps.itemData);
				}.bind(this), 150);
			}
		}
	},
	componentDidMount: function(){
		if(this.props.itemData){
			this.setState(this.props.itemData);
		}

		var progressInput = this.refs.progressInput.getDOMNode();
		$(progressInput).on('mousewheel', function(e){
			this.setProgress(Number(this.state.itemProgress) + e.deltaY);
			return false;
		}.bind(this));

		var repeatsInput = this.refs.repeatsInput.getDOMNode();
		$(repeatsInput).on('mousewheel', function(e){
			this.setRepeats(Number(this.state.itemRepeats) + e.deltaY);
			return false;
		}.bind(this));

		$(window).on('keyup', function(e){
			if(e.keyCode === 27){
				this.props.onCancel();
			}
		}.bind(this));
	},
	setStatus: function(e){
		var statusVal = e.target.innerText.toLowerCase().replace(/ /g, '');
		this.setState({
			itemStatusDisplay: e.target.innerText,
			itemStatus: statusVal
		});
		this.toggleStatusMenu();
	},
	toggleStatusMenu: function(){
		if(this.state.statusMenuVisible){
			$(this.refs.pickerStatusMenu.getDOMNode()).find('>div').hide();
		} else {
			$(this.refs.pickerStatusMenu.getDOMNode()).find('>div').stop(true)
			.velocity('transition.slideLeftIn', { stagger: 50, duration: 300 });
		}
		this.setState({
			statusMenuVisible: !this.state.statusMenuVisible
		});
	},
	onProgressChange: function(e){
		// This function is here because we want to pass
		// a value to setProgress and not an event.
		this.setProgress(e.target.value); 
	},
	setProgress: function(progressValue){
		if(
			!isNaN(progressValue) &&
			(progressValue <= this.props.seriesData.series_episodes_total &&
			0 <= progressValue ||
			!this.props.seriesData.series_episodes_total)
		){
			this.setState({
				itemProgress: (progressValue === 0) ? '' : Number(progressValue)
			});
		}
	},
	onRepeatsChange: function(e){
		this.setRepeats(e.target.value);
	},
	setRepeats: function(repeatsValue){
		if(!isNaN(repeatsValue) && repeatsValue >= 0 && repeatsValue <= 999){
			this.setState({
				itemRepeats: (repeatsValue === 0) ? '' : repeatsValue
			});
		}
	},
	setRatingPreview: function(rating, e){
		var posX = e.pageX - $(e.target).offset().left;
		this.setState({
			ratingPreview: (posX < 11) ? Number(rating) : Number(rating + 1)
		});
	},
	resetRatingPreview: function(){
		this.setState({
			ratingPreview: ''
		});
	},
	onRatingClick: function(e){
		this.setState({
			itemRating: this.state.ratingPreview
		});
	},
	onSave: function(){
		$(this.refs.successBtn.getDOMNode()).stop(true).velocity('transition.fadeIn', {
			duration: 100
		}).velocity('reverse', {
			delay: 600,
			duration: 300
		});

		$(this.refs.successIcon.getDOMNode()).stop(true).velocity({
			scale: [1, 0]
		}, 600, [200, 16])
		.velocity('reverse', {
			delay: 400,
			duration: 0
		});
		setTimeout(function(){
			this.props.onSave(this.state);
		}.bind(this), 550);
	},
	render: function(){
		var heartNodes = [];
		var ratingPreview = (this.state.ratingPreview !== '') ? this.state.ratingPreview : this.state.itemRating;

		for(var i = 1; i <= 9; i += 2){
			heartNodes.push(
				<div
					className={
						cx({
							'picker-heart': true,
							'icon-heart-empty': (ratingPreview < i),
							'icon-heart-half': (ratingPreview === i),
							'icon-heart-full': (ratingPreview >= i + 1)
						})
					}
					onMouseMove={this.setRatingPreview.bind(this, i)}
					onMouseOut={this.resetRatingPreview}
					onClick={this.onRatingClick}
				>
				</div>
			)
		}

		return (
			<div className="picker-wrap">
				<div className="picker-top">
					<div className="picker-title">
						Status
					</div>
					<div className="picker-status-wrap">
						<div ref="pickerStatusVal" className={cx({
							'picker-status-val': true,
							'visible': this.state.statusMenuVisible
						})} onClick={this.toggleStatusMenu}>
							{this.state.itemStatusDisplay}
							<div className={
								cx({
									'picker-status-menu-icon': true,
									'icon-down-open': true,
									'rotate': this.state.statusMenuVisible
								})
							}></div>
						</div>
						<div ref="pickerStatusMenu" className={
								cx({
									'picker-status-menu': true,
									'visible': this.state.statusMenuVisible
								})
							}>
							{
								['Current', 'Completed', 'Planned', 'On Hold', 'Dropped'].map(function(statusType){
									return (
										<div ref="pickerStatusItem" className="picker-status-menu-item" onClick={this.setStatus}>
											{statusType}
										</div>
									);
								}.bind(this))
							}
						</div>
					</div>
					<div className="picker-inputs-wrap">
						<div className="picker-repeats-wrap">
							<div className="picker-title">
								Re-watched
							</div>
							<div className="cf">
								<input
									ref="repeatsInput"
									className="picker-input-val"
									type="text"
									maxLength="3"
									value={this.state.itemRepeats}
									onChange={this.onRepeatsChange}
									placeholder="0"
								/>
								<div className="picker-input-times">
									times
								</div>
							</div>
						</div>
						<div className="picker-progress-wrap">
							<div className="picker-title">
								Progress
							</div>
							<div className="cf">
								<input
									ref="progressInput"
									className="picker-input-val"
									type="text"
									maxLength="3"
									value={this.state.itemProgress}
									onChange={this.onProgressChange}
									placeholder="0"
								/>
								<div className="picker-input-sep">
								of
								</div>
								<div className="picker-input-total">
									{this.props.seriesData.series_episodes_total}
								</div>
							</div>
						</div>

					</div>
					<div className="picker-title">
						Rating
					</div>
					<div className="picker-rating-wrap">
						<div className="picker-rating-val">
							{(this.state.itemRating / 2).toFixed(1)}
						</div>
						<div className="picker-rating-hearts">
							{heartNodes}
						</div>
					</div>
				</div>
				<div className="picker-bottom">
					<div className="picker-save" onClick={this.onSave}>
						Save
						<div className="picker-save-success" ref="successBtn">
							<div className="picker-save-success-icon icon-check" ref="successIcon">
							</div>
						</div>
					</div>
					<div className="picker-cancel" onClick={this.props.onCancel}>
						Cancel
					</div>
				</div>
			</div>
		);
	}
});