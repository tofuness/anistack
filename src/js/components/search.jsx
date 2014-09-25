/** @jsx React.DOM */

var searchApp = React.createClass({
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
			searchText: e.target.value || ''
		});

		if(e.target.value !== ''){
			this.search();
		} else {
			this.setState({
				searchResults: []
			});
		}
	},
	search: _.debounce(function(){
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
	}, 300),
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
						return <searchItem seriesData={searchRes} key={searchRes._id} />;
					})
				}
				</div>
			</div>
		);
	}
});

var searchItem = React.createClass({
	getInitialState: function() {
		return {
			pickerVisible: false 
		};
	},
	togglePicker: function(visible){
		this.setState({
			pickerVisible: !this.state.pickerVisible 
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
								'search-result-add': true 
							})
						} onClick={this.togglePicker}>+ Add</div>
						<div className={
							cx({
								'search-result-picker': true,
								'visible': this.state.pickerVisible
							})
						}>
							<pickerApp
								seriesData={this.props.seriesData}
								onClose={this.togglePicker}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}
});

React.renderComponent(<searchApp />, document.getElementById('search-page-wrap'));