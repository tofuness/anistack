/** @jsx React.DOM */

var ReactClassSet = React.addons.classSet;

var searchComp = React.createClass({
	getInitialState: function(){
		var comp = {
			searchText: '',
			searchResults: []
		}
		return comp;
	},
	componentDidMount: function(){
		$.ajax({
			type: 'get',
			url: '/data/10.json',
			success: function(res){
				this.setState({
					searchResults: res
				});
			}.bind(this)
		});
	},
	search: function(e){
		this.setState({
			searchText: e.target.value
		});
	},
	render: function(){
		var searchResults = [];

		for(var i = 0; i < this.state.searchResults.length; i++){
			searchResults.push(
				<searchResComp
					itemData={this.state.searchResults[i]}
				/>
			)
		}

		return (
			<div className="search-wrap">
				<div className="search-input-wrap">
					<input
						className="search-input"
						type="text"
						maxLength="20"
						placeholder="Search for stuff..."
						value={this.state.searchText}
						onChange={this.search}
					/>
				</div>
				<div className="search-results-wrap" onScroll={this.closePickers}>
					{searchResults}
				</div>
			</div>
		)
	}
});

var searchResComp = React.createClass({
	propTypes: {
		itemData: React.PropTypes.object
	},
	getInitialState: function(){
		var comp = {
			added: false,
			pickerVisible: false
		}
		return comp;
	},
	componentDidMount: function(){
		PubSub.subscribe(constants.CLOSE_PICKERS, this.close);
	},
	togglePicker: function(e){
		if(this.state.added) return false;
		PubSub.publishSync(constants.CLOSE_PICKERS);
		this.setState({
			pickerVisible: !this.state.pickerVisible
		});
	},
	close: function(){
		if(this.state.added || !this.state.pickerVisible) return false;
		this.setState({
			pickerVisible: false
		});
	},
	finish: function(){
		this.setState({
			added: true,
			pickerVisible: false
		});
	},
	render: function(){
		return (
			<div className="search-item-wrap">
				<div className="search-item">
					<div className="search-item-left">
						<div className="search-item-title">
							{this.props.itemData.seriesTitle}
						</div>
						<div className="search-item-meta">
							<span className="search-item-type">{this.props.itemData.seriesType}</span>
							<span className="search-item-total"> with {this.props.itemData.seriesTotal} Episodes</span>
						</div>
					</div>
					<div className="search-item-right">
						<div className={
							ReactClassSet({
								'search-item-add': true,
								'open': this.state.pickerVisible,
								'added': this.state.added
							})
						} onClick={this.togglePicker} title="...to your list">
							{
								(this.state.added) ? 'Added' : '+ Add'
							}
						</div>
						<pickerComp
							itemData={this.props.itemData}
							visible={this.state.pickerVisible}
							finish={this.finish}
						/>
					</div>
				</div>
			</div>
		)
	}
});

React.renderComponent(<searchComp />, document.getElementById('search-page'));