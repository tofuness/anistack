var cx = React.addons.classSet;
var pickerApp = React.createClass({
	propTypes: {
		seriesData: React.PropTypes.object
	},
	getInitialState: function(){
		return {
			itemStatus: 'Current',
			itemProgress: '',
			itemRating: '',
			itemRepeats: '',
			ratingPreview: '',
			statusMenuVisible: false
		}
	},
	componentDidMount: function(){
		// This might need some improvement
		// Pass in itemData props to overwrite the default values
		if(this.props.itemData){
			this.setState(this.props.itemData);
		}

		var progressInput = this.refs.progressInput.getDOMNode();
		$(progressInput).on('mousewheel', function(e, delta){
			this.setProgress(Number(this.state.itemProgress) + delta);
			return false;
		}.bind(this));

		var repeatsInput = this.refs.repeatsInput.getDOMNode();
		$(repeatsInput).on('mousewheel', function(e, delta){
			this.setRepeats(Number(this.state.itemRepeats) + delta);
			return false;
		}.bind(this));
	},
	setStatus: function(e){
		this.setState({
			statusMenuVisible: false,
			itemStatus: e.target.innerText
		});
	},
	toggleStatusMenu: function(){
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
				itemProgress: (progressValue === 0) ? '' : progressValue
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
				<div className="picker-title">
					Status
				</div>
				<div className="picker-status-wrap">
					<div className={cx({
						'picker-status-val': true,
						'visible': this.state.statusMenuVisible
					})} onClick={this.toggleStatusMenu}>
						{this.state.itemStatus}
						<div className={
							cx({
								'picker-status-dd-icon': true,
								'icon-down-open': !this.state.statusMenuVisible,
								'icon-up-open': this.state.statusMenuVisible
							})
						}></div>
					</div>
					<div className={
							cx({
								'picker-status-dd': true,
								'visible': this.state.statusMenuVisible
							})
						}>
						{
							['Current', 'Completed', 'Planned', 'On Hold', 'Dropped'].map(function(statusType){
								return (
									<div className="picker-status-dd-item" onClick={this.setStatus}>
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
					<div className="picker-rating-hearts">
						{heartNodes}
					</div>
					<div className="picker-rating-val">
						{(this.state.itemRating / 2).toFixed(1)}
					</div>
				</div>
				<div className="picker-actions">
					<div className="picker-save">
						Save
					</div>
					<div className="picker-cancel">
						Cancel
					</div>
				</div>
			</div>
		);
	}
});