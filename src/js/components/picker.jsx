var cx = React.addons.classSet;
var pickerApp = React.createClass({
	propTypes: {
		seriesData: React.PropTypes.object,
		pickerStatus: React.PropTypes.bool,
		pickerProgress: React.PropTypes.bool,
		pickerRating: React.PropTypes.bool
	},
	getInitialState: function(){
		return {
			itemStatus: 'Current',
			itemProgress: '',
			itemRating: '',
			statusMenuVisible: false
		}
	},
	componentDidMount: function(){
		// This might need some improvement
		if(this.props.itemData){
			this.setState(this.props.itemData);
		}
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
	setProgress: function(e){
		if(
			!isNaN(e.target.value) &&
			(e.target.value <= this.props.seriesData.series_episodes_total ||
			!this.props.seriesData.series_episodes_total)
		){
			this.setState({
				itemProgress: e.target.value
			});
		}
	},
	render: function(){
		return (
			<div className="picker-wrap">
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
						<div className="picker-status-legend">(Status)</div>
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
				<div className="picker-progress-wrap">
					<div className="picker-input-title">
						Progress
					</div>
					<input
						type="text"
						maxLength="3"
						value={this.state.itemProgress}
						onChange={this.setProgress}
					/>
					<div className="picker-input-sep">
					of
					</div>
					<div className="picker-input-total">
						{this.props.seriesData.series_episodes_total}
					</div>
				</div>
				<div className="picker-rating-wrap">
				</div>
			</div>
		);
	}
});