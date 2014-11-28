var TempSearchConstants = {
	QUERY: $('#search-page-wrap').data('query'),
	COLLECTION: $('#search-page-wrap').data('collection')
}
var cx = React.addons.classSet;
var PickerApp = require('./picker.jsx');
var SearchApp = React.createClass({
	getInitialState: function() {
		var initState = {
			searchText: TempSearchConstants.QUERY,
			searchLoading: false,
			searchResults: []
		}
		return initState;
	},
	componentDidMount: function() {
		if (this.state.searchText !== '') this.search();
		this.refs.searchInput.getDOMNode().focus();
	},
	onSearch: function(e) {
		e.persist();
		this.setState({
			searchText: e.target.value,
			searchLoading: true,
			searchResults: (e.target.value === '') ? [] : this.state.searchResults
		});
		if (e.target.value !== '') {
			this.search();
		}
	},
	search: _.debounce(function() {
		if (this.state.searchText === '') return false;
		$.ajax({
			type: 'get',
			url: '/api/' + TempSearchConstants.COLLECTION + '/search/' + this.state.searchText,
			success: function(searchRes) {
				this.setState({
					searchLoading: false,
					searchResults: searchRes
				});
			}.bind(this),
			error: function(err) {
				console.log(err);
			}
		});
	}, 500),
	onEsc: function(e) {
		// On escape, clear the search
		if (e.key === 'Escape') {
			this.setState({ searchText: '', searchResults: [] });
		}
	},
	render: function() {
		return (
			<div>
				<div id="search-input-wrap">
					<div id="seach-input-protip">
						Tip: Use quotes (e.g., {(TempSearchConstants.COLLECTION === 'anime') ? '"sword art online"' : '"koe no katachi"'}) to search <em>exactly</em> for that phrase.
					</div>
					<input id="search-input" type="text" placeholder="Type to search..." ref="searchInput" value={this.state.searchText} onChange={this.onSearch} onKeyUp={this.onEsc} />
				</div>
				<div id="search-page">
					{(this.state.searchResults.length === 0 && this.state.searchText !== '' && !this.state.searchLoading) ? <SearchNoResults /> : null}
					<div id="search-results-wrap">
					{
						this.state.searchResults.map(function(searchRes, index) {
							var itemData = null;
							if (searchRes.item_data) {
								itemData = {
									item_status: searchRes.item_data.item_status,
									item_progress: searchRes.item_data.item_progress,
									item_rating: searchRes.item_data.item_rating,
									item_repeats: searchRes.item_data.item_repeats
								}
							}
							return <SearchItem seriesData={searchRes} key={searchRes._id} itemData={itemData} indexNum={index} />;
						})
					}
					</div>
				</div>
			</div>
		);
	}
});

var SearchNoResults = React.createClass({
	componentDidMount: function() {
		$(this.refs.searchNoRes.getDOMNode()).velocity('transition.slideUpIn', {
			delay: 100,
			duration: 300
		});
	},
	render: function() {
		return (
			<div id="search-results-empty" ref="searchNoRes">
				No matches. Try another search term.
			</div>
		);
	}
})

var SearchItem = React.createClass({
	getInitialState: function() {
		return {
			itemData: {}, // List item data,
			itemExcerpt: '',
			itemAdded: false, // If the item added in list
			pickerVisible: false 
		};
	},
	componentWillMount: function() {
		if (this.props.itemData) {
			this.setState({
				itemData: this.props.itemData,
				itemAdded: true
			});
		}
		if (!this.props.seriesData.series_synopsis) return false;
		var exceprtSuggestions = new JsSummarize().summarize(this.props.seriesData.series_title_main, this.props.seriesData.series_synopsis);
		this.setState({
			itemExcerpt: exceprtSuggestions[0]
		});
	},
	togglePicker: function() {
		this.setState({
			pickerVisible: !this.state.pickerVisible 
		});
	},
	closePicker: function() {
		this.setState({
			itemData: this.state.itemData,
			pickerVisible: false
		});
	},
	saveData: function(data) {
		var APIUrl = (Object.keys(this.state.itemData).length > 0) ? '/api/list/' + TempSearchConstants.COLLECTION + '/update' : '/api/list/' + TempSearchConstants.COLLECTION + '/add';
		data._id = this.props.seriesData._id;
		data._csrf = UserConstants.CSRF_TOKEN;

		$.ajax({
			type: 'post',
			url: APIUrl,
			data: data,
			success: function(res) {
				console.log(res); 
				this.setState({
					itemData: data,
					itemAdded: true,
					pickerVisible: false
				});
			}.bind(this),
			error: function() {
				if (!this.props.itemData) {
					this.onRemove();
				} else {
					this.closePicker();
				}
				confirm('Could not add/update series. Something seems to be wrong on our end!');
			}.bind(this)
		});
	},
	onRemove: function() {
		$.ajax({
			type: 'post',
			url: '/api/list/' + TempSearchConstants.COLLECTION + '/remove',
			data: {
				_id: this.props.seriesData._id,
				_csrf: UserConstants.CSRF_TOKEN
			},
			success: function(res) {
				this.setState({
					itemData: {},
					itemAdded: false
				});
			}.bind(this),
			error: function() {
				this.closePicker();
				confirm('Could not remove series. Something seems to be wrong on our end!');
			}.bind(this)
		});
	},
	render: function() {
		var imageStyle = {
			backgroundImage: 'url(' + this.props.seriesData.series_image_reference + ')'
		}
		return (
			<div className="search-result">
				<div className="search-result-image" style={imageStyle}>
				</div>
				<div className="search-result-content">
					<div className="search-result-title-wrap">
						<a className="search-result-title link" href={'/' + TempSearchConstants.COLLECTION + '/' + this.props.seriesData.series_slug}>
							{this.props.seriesData.series_title_main}
						</a>
						<div className="search-result-year">
						{
							(this.props.seriesData.series_date_start) ? new Date(this.props.seriesData.series_date_start).getFullYear() : ''
						}
						</div>
					</div>
					<div className="search-result-desc">
						{this.state.itemExcerpt}
					</div>
					<div className="search-result-meta-wrap">
						<span className="search-result-meta">
							<span className="search-result-type">
								{this.props.seriesData.series_type}
							</span> with {this.props.seriesData.series_episodes_total || '—'} {TempSearchConstants.COLLECTION === 'anime' ? 'Episode(s)' : 'Chapter(s)'}
						</span>
						<div className={
							cx({
								'search-result-add': true,
								'visible': UserConstants.LOGGED_IN,
								'added': this.state.itemAdded,
								'open': this.state.pickerVisible
							})
						} onClick={this.togglePicker}>
							{
								(this.state.itemAdded) ? 'Edit info' : '+ Add to list'
							}
						</div>
						<div className={
							cx({
								'search-result-picker': true,
								'first': this.props.indexNum === 0,
								'visible': this.state.pickerVisible
							})
						}>
							<PickerApp
								collection={TempSearchConstants.COLLECTION}
								itemData={this.state.itemData}
								seriesData={this.props.seriesData}
								onCancel={this.closePicker}
								onSave={this.saveData}
							/>
						</div>
						<div className={
							cx({
								'search-result-remove': true,
								'visible': UserConstants.LOGGED_IN && this.state.itemAdded,
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

module.exports = SearchApp;


