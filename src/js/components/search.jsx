/** @jsx React.DOM */

var SearchApp = React.createClass({
	getInitialState: function(){
		var initState = {
			searchText: $('#search-page-query').text().trim(),
			searchResults: []
		}
		return initState;
	},
	componentDidMount: function(){
		if(this.state.searchText) this.search();
	},
	onSearch: function(e){
		this.setState({
			searchText: e.target.value,
			searchResults: (e.target.value === '') ? [] : this.state.searchResults
		});
		if(e.target.value !== ''){
			this.search();
		}
	},
	search: _.debounce(function(){
		if(this.state.searchText === '') return false;
		$.ajax({
			type: 'get',
			url: '/api/anime/search/' + this.state.searchText,
			success: function(searchRes){
				this.setState({
					searchResults: searchRes
				});
			}.bind(this),
			error: function(err){
				console.log(err);
			}
		});
	}, 500),
	onEsc: function(e){
		// On escape, clear the search
		if(e.key === 'Escape'){ 
			this.setState({ searchText: '', searchResults: [] });
		}
	},
	render: function(){
		return (
			<div id="search-page">
				<div id="search-input-wrap">
					<input id="search-input" type="text" placeholder="Type to search..." value={this.state.searchText} onChange={this.onSearch} onKeyUp={this.onEsc} />
				</div>
				<div id="search-results-wrap">
				{
					this.state.searchResults.map(function(searchRes){
						var itemData = null;
						if(searchRes.item_data){
							itemData = {
								item_status: searchRes.item_data.item_status,
								item_progress: searchRes.item_data.item_progress,
								item_rating: searchRes.item_data.item_rating,
								item_repeats: searchRes.item_data.item_repeats
							}
						}
						return <SearchItem seriesData={searchRes} key={searchRes._id} itemData={itemData} />;
					})
				}
				</div>
			</div>
		);
	}
});

var SearchItem = React.createClass({
	getInitialState: function() {
		return {
			itemData: {}, // List item data,
			itemAdded: false, // If the item added in list
			pickerVisible: false 
		};
	},
	componentWillMount: function(){
		if(this.props.itemData){
			this.setState({
				itemData: this.props.itemData,
				itemAdded: true
			});
		}
	},
	togglePicker: function(visible){
		this.setState({
			pickerVisible: !this.state.pickerVisible 
		});
	},
	closePicker: function(){
		this.setState({
			itemData: this.state.itemData,
			pickerVisible: false
		});
	},
	saveData: function(data){
		var APIUrl = (Object.keys(this.state.itemData).length > 0) ? '/api/list/anime/update' : '/api/list/anime/add';
		data._id = this.props.seriesData._id;

		$.ajax({
			type: 'post',
			url: APIUrl,
			data: data,
			success: function(res){
				console.log(res); 
			}
		});

		this.setState({
			itemData: data,
			itemAdded: true,
			pickerVisible: false
		});
	},
	onRemove: function(){
		this.setState({
			itemData: {},
			itemAdded: false
		});

		$.ajax({
			type: 'post',
			url: '/api/list/anime/remove',
			data: {
				_id: this.props.seriesData._id
			},
			success: function(res){
				console.log(res);
			}
		});
	},
	render: function(){
		var imageStyle = {
			backgroundImage: 'url(' + this.props.seriesData.series_image_reference + ')'
		}
		return (
			<div className="search-result">
				<div className="search-result-image" style={imageStyle}>
				</div>
				<div className="search-result-content">
					<div className="search-result-title-wrap">
						<div className="search-result-title">
							{this.props.seriesData.series_title_main}
						</div>
						<div className="search-result-year">
						{
							(this.props.seriesData.series_date_start) ? new Date(this.props.seriesData.series_date_start).getFullYear() : ''
						}
						</div>
					</div>
					<div className="search-result-desc">
						{this.props.seriesData.series_description}
					</div>
					<div className="search-result-meta-wrap">
						<span className="search-result-meta">
							<span className="search-result-type">{this.props.seriesData.series_type}</span> with {this.props.seriesData.series_episodes_total} Episode(s)
						</span>
						<div className={
							cx({
								'search-result-add': true,
								'visible': USER.LOGGED_IN,
								'added': this.state.itemAdded,
								'open': this.state.pickerVisible
							})
						} onClick={this.togglePicker}>
							{
								(this.state.itemAdded) ? 'Edit info' : 'Add to list +'
							}
						</div>
						<div className={
							cx({
								'search-result-picker': true,
								'visible': this.state.pickerVisible
							})
						}>
							<PickerApp
								itemData={this.state.itemData}
								seriesData={this.props.seriesData}
								onCancel={this.closePicker}
								onSave={this.saveData}
							/>
						</div>
						<div className={
							cx({
								'search-result-remove': true,
								'visible': USER.LOGGED_IN && this.state.itemAdded,
							})
						} onClick={this.onRemove}>
							&times; Remove
						</div>
					</div>
				</div>
			</div>
		)
	}
});
var mountNode = document.getElementById('search-page-wrap');
if(mountNode) React.renderComponent(<SearchApp />, mountNode);



