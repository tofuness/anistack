var cx = React.addons.classSet;
var PickerApp = React.createClass({
	propTypes: {
		collection: React.PropTypes.string,
		seriesData: React.PropTypes.object,
		onClose: React.PropTypes.func,
		onSave: React.PropTypes.func,
		onRemove: React.PropTypes.func
	},
	getInitialState: function(){
		return {
			item_status: 'current',
			item_progress: '',
			item_rating: '',
			item_repeats: '',
			ratingPreview: '',
			statusMenuVisible: false,
			saving: false
		}
	},
	componentDidUpdate: function(prevProps, prevState){
		var episodesTotal = this.props.seriesData.series_episodes_total;

		// If statement below is there to make sure no infinite-loop happen

		if(
			this.state.item_status === 'completed' !==
			(this.state.item_progress === episodesTotal) && episodesTotal
		){

			// (1) If changed status to completed: bump up the item_progress

			if(this.state.item_status === 'completed' && prevState.item_status !== 'completed'){
				this.setState({
					item_progress: episodesTotal
				});
			}

			// (2) If changed the status from completed: remove the item_progress

			if(prevState.item_status === 'completed' && this.state.item_status !== 'completed'){
				this.setState({
					item_progress: ''
				});
			}

			// (3) If changed the progress to e.g. 10/10: change the status to completed. Can be combined with (1)

			if(prevState.item_progress < episodesTotal && this.state.item_progress === episodesTotal){
				this.setState({
					item_status: 'completed'
				});
			}

			// (4) If changed the progress to e.g. 5/10: change the status to current. Can be combined with (3)

			if(prevState.item_progress === episodesTotal && this.state.item_progress < episodesTotal){
				this.setState({
					item_status: 'current'
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
			this.setProgress(Number(this.state.item_progress) + e.deltaY);
			return false;
		}.bind(this));

		var repeatsInput = this.refs.repeatsInput.getDOMNode();
		$(repeatsInput).on('mousewheel', function(e){
			this.setRepeats(Number(this.state.item_repeats) + e.deltaY);
			return false;
		}.bind(this));

		$(window).on('keyup', function(e){
			if(e.keyCode === 27){
				this.props.onCancel();
			}
		}.bind(this));
	},
	setStatus: function(e){
		var statusVal = $(e.target).text().toLowerCase().replace(/ /g, '');
		this.setState({
			item_status: statusVal
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
			(progressValue <= this.props.seriesData.series_episodes_total ||
			!this.props.seriesData.series_episodes_total) &&
			0 <= progressValue
		){
			this.setState({
				item_progress: (progressValue == 0) ? '' : Number(progressValue)
			});
		}
	},
	onRepeatsChange: function(e){
		this.setRepeats(e.target.value);
	},
	setRepeats: function(repeatsValue){
		if(!isNaN(repeatsValue) && repeatsValue >= 0 && repeatsValue <= 999){
			this.setState({
				item_repeats: (repeatsValue == 0) ? '' : repeatsValue
			});
		}
	},
	setRatingPreview: function(rating, e){
		var posX = e.pageX - $(e.target).offset().left;
		if(rating === 1 && posX < 21){
			this.setState({
				ratingPreview: (posX > 10) ? Number(rating) : 0
			});
		} else {
			this.setState({
				ratingPreview: (posX < 11) ? Number(rating) : Number(rating + 1)
			});
		}
	},
	resetRatingPreview: function(){
		this.setState({
			ratingPreview: ''
		});
	},
	onRatingClick: function(e){
		this.setState({
			item_rating: this.state.ratingPreview
		});
	},
	onSave: function(){
		if(this.state.saving) return false;
		this.setState({
			saving: true
		});
		$(this.refs.successBtn.getDOMNode()).stop(true).velocity('transition.fadeIn', {
			duration: 200
		}).velocity('reverse', {
			delay: 500,
			duration: 300
		});

		$(this.refs.successIcon.getDOMNode()).stop(true).velocity('transition.slideUpIn', {
			delay: 100,
			duration: 300
		}).delay(600).hide();
		setTimeout(function(){
			this.setState({
				saving: false
			});
			this.props.onSave(this.state);
		}.bind(this), 550);
	},
	render: function(){
		var heartNodes = [];
		var ratingPreview = (this.state.ratingPreview !== '') ? this.state.ratingPreview : this.state.item_rating;

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
							{this.state.item_status.replace('onhold', 'On Hold')}
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
								{
									(this.props.collection === 'anime') ? 'Re-watched' : 'Re-read'
								}
							</div>
							<div className="cf">
								<input
									ref="repeatsInput"
									className="picker-input-val"
									type="text"
									maxLength="3"
									value={this.state.item_repeats}
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
									value={this.state.item_progress}
									onChange={this.onProgressChange}
									placeholder="0"
								/>
								<div className="picker-input-sep">
								of
								</div>
								<div className="picker-input-total">
									{this.props.seriesData.series_episodes_total || '—'}
								</div>
							</div>
						</div>

					</div>
					<div className="picker-title">
						Rating
					</div>
					<div className="picker-rating-wrap">
						<div className="picker-rating-hearts">
							{heartNodes}
						</div>
						<div className="picker-rating-val">
							{(this.state.item_rating / 2).toFixed(1)}
						</div>
					</div>
				</div>
				<div className="picker-bottom">
					<div className="picker-save" onClick={this.onSave}>
						Save
						<div className="picker-save-success" ref="successBtn">
							<div className="picker-save-success-icon icon-check-thin" ref="successIcon">
							</div>
						</div>
					</div>
					{this.props.onCancel ? <div className="picker-cancel" onClick={this.props.onCancel}>Cancel</div> : null}
					{this.props.onRemove ? <div className="picker-remove" onClick={this.props.onRemove}>&times; Remove</div> : null}
				</div>
			</div>
		);
	}
});

module.exports = PickerApp;