/** @jsx React.DOM */

var ReactClassSet = React.addons.classSet;

var pickerProgressComp = React.createClass({
	propTypes: {
		itemData: React.PropTypes.object,
		visible: React.PropTypes.bool,
		prevProgress: React.PropTypes.number
	},
	getInitialState: function(){
		var comp = {
			done: false,
			progressPreview: '',
			progressNew: ''
		}
		return comp;
	},
	componentDidUpdate: function(){
		if(this.props.visible && this){
			this.refs.progInput.getDOMNode().focus();
		}
	},
	componentWillReceiveProps: function(nextProps){
		if(!this.props.visible && nextProps.visible){
			this.replaceState(this.getInitialState());
		}
	},
	previewProgress: function(e){
		var inputValue = Number(e.target.value);

		if(
			!isNaN(inputValue) &&
			(inputValue <= this.props.itemData.seriesTotal ||
			!this.props.itemData.seriesTotal)
		){
			this.setState({
				progressPreview: inputValue
			});
		}
	},
	setProgress: function(e){
		if(e.key === 'Enter' || e.type === 'blur'){
			if(this.state.progressPreview !== ''){
				var tempItem = _.clone(this.props.itemData);
				tempItem.itemProgress = this.state.progressPreview;
				PubSub.publishSync(constants.UPDATE_ITEM, tempItem);
			}
			this.props.close();
		} else if(e.key === 'Escape'){
			this.props.close();
		}
	},
	render: function(){
		return (
			<div className={
				ReactClassSet({
					'picker-progress-single': true,
					'visible': this.props.visible
				})
			}>
				<input 
					ref="progInput"
					maxLength="3"
					placeholder={this.props.itemData.itemProgress}
					className="picker-progress-input"
					value={this.state.progressPreview}
					onChange={this.previewProgress}
					onKeyDown={this.setProgress}
					onBlur={this.setProgress}
				/>
				<div className="picker-progress-sep">of</div>
				<div className="picker-progress-total">
					{
						(this.props.itemData.seriesTotal) ? this.props.itemData.seriesTotal : '—'
					}
				</div>
			</div>

		)
	}
});

var pickerRatingComp = React.createClass({
	propTypes: {
		close: React.PropTypes.func,
		itemData: React.PropTypes.object,
		prevRating: React.PropTypes.number
	},
	getInitialState: function(){
		var comp = {
			done: false,
			visible: false,
			ratingPreview: '',
			ratingNew: ''
		}
		return comp;
	},
	componentWillReceiveProps: function(nextProps){
		if(!this.props.visible && nextProps.visible){
			this.replaceState(this.getInitialState());
		}
	},
	showPreview: function(rating, e){
		// WORK: This looks horrible
		// 15 === Padding to left
		// 27 === Half width of heart
		var posX = e.pageX - $(e.target).offset().left;
		if(rating === 1){
			if(posX < 15){
				this.setState({
					ratingPreview: 0
				});
			} else if(posX < 27){
				this.setState({
					ratingPreview: Number(rating)
				});
			} else {
				this.setState({
					ratingPreview: Number(rating + 1)
				});
			}
		} else {
			if(posX < 12){
				this.setState({
					ratingPreview: Number(rating)
				});
			} else {
				this.setState({
					ratingPreview: Number(rating + 1)
				});
			}
		}
	},
	resetPreview: function(){
		this.setState({
			ratingPreview: ''
		});
	},
	setRating: function(){
		this.setState({
			done: true,
			ratingNew: this.state.ratingPreview
		});

		var tempItem = _.clone(this.props.itemData);

		tempItem.itemRating = this.state.ratingPreview;
		PubSub.publishSync(constants.UPDATE_ITEM, tempItem);
		setTimeout(function(){
			this.props.close();
		}.bind(this), 150);
	},
	render: function(){
		var heartNodes = [];

		// WORK: Some ugly conditions there

		var defaultRating = (this.state.ratingNew !== '') ? this.state.ratingNew : this.props.prevRating;
		var tempRating = (this.state.ratingPreview !== '') ? this.state.ratingPreview : defaultRating;

		for(var i = 1; i <= 9; i += 2){
			heartNodes.push(
				<div
					className={
						ReactClassSet({
							'picker-heart': true,
							'icon-heart-empty': (tempRating < i),
							'icon-heart-half': (tempRating === i),
							'icon-heart-full': (tempRating >= i + 1)
						})
					}
					onMouseMove={this.showPreview.bind(this, i)}
					onMouseOut={this.resetPreview}
					onClick={this.setRating}
				>
				</div>
			)
		}

		return (
			<div className={
				ReactClassSet({
					'picker-rating-single': true,
					'visible': this.props.visible
				})
			}>
				{heartNodes}
				<div className="picker-rating-number">
					{(defaultRating / 2).toFixed(1)}
				</div>
				<div className={
					ReactClassSet({
						'visible': this.state.done,
						'picker-done': true
					})
				}>
				</div>
			</div>
		);
	}
})