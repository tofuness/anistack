/** @jsx React.DOM */

var listStore = [];
var cx = React.addons.classSet;

var ListApp = React.createClass({
	getInitialState: function(){
		return {
			listFilterText: '',
			listFilterStatus: 'all',
			listLoaded: false, // Display list if true
			listLastSort: 'series_title_main', // Property name from API
			listLastOrder: 'asc'
		}
	},
	componentDidMount: function(){
		PubSub.subscribe(constants.DATA_CHANGE, this.reloadList);
		$.ajax({
			url: '/api/list/anime/view/' + USER.USERNAME,
			type: 'get',
			success: function(listData){
				listStore = listData;
				PubSub.publishSync(constants.DATA_CHANGE, listData);
			},
			error: function(err){
				console.log(err);
			}
		});
	},
	reloadList: function(data){
		this.sortList(this.state.listLastSort, this.state.listLastOrder);

		// First load
		if(!this.state.listLoaded){
			this.setState({
				listLoaded: true
			});
		}
	},
	sortList: function(sortBy, order){
		sortBy = sortBy || 'series_title_main';

		// Decide if it should be asc or desc

		if((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)){
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else if(!order){
			order = 'asc';
		}

		var listSorted = keysort(listStore, 'item_status, ' + sortBy + ' ' + order +', series_title_main');
		this.setState({
			listData: listStore,
			listLastSort: sortBy,
			listLastOrder: order
		});
	},
	setStatusFilter: function(statusVal){
		this.setState({
			listFilterStatus: statusVal
		});
	},
	setTextFilter: function(e){
		this.setState({
			listFilterText: e.target.value
		});
	},
	render: function(){
		var listStyle = {
			display: this.state.listLoaded
		}
		return (
			<div style={listStyle}>
				<div id="list-top">
					<div id="list-tabs-wrap">
						{
							['All', 'Current', 'Completed', 'Planned', 'On Hold', 'Dropped'].map(function(statusName){
								var statusVal = statusName.toLowerCase().replace(/ /g, '')
								return (
									<div className={cx({
										'list-tab': true,
										'current': (statusVal === this.state.listFilterStatus)
									})} onClick={this.setStatusFilter.bind(this, statusVal)}>
										{statusName}
									</div>
								)
							}.bind(this))
						}
					</div>
					<div id="list-filter-wrap">
						<input type="text" maxLength="50" id="list-filter-input" placeholder="Filter your list..." onChange={this.setTextFilter} />
					</div>
					<div id="list-sort-wrap">
						<div id="list-sort-title" className="list-sort-hd" onClick={this.sortList.bind(this, 'series_title_main', null)}>
							Title
						</div>
						<div id="list-sort-progress" className="list-sort-hd" onClick={this.sortList.bind(this, 'item_progress', null)}>
							Progress
						</div>
						<div id="list-sort-rating" className="list-sort-hd" onClick={this.sortList.bind(this, 'item_rating', null)}>
							Rating
						</div>
						<div id="list-sort-type" className="list-sort-hd" onClick={this.sortList.bind(this, 'series_type', null)}>
							Type
						</div>
					</div>
				</div>
				<ListContent
					listData={this.state.listData}
					listLoaded={this.state.listLoaded}
					listFilterText={this.state.listFilterText}
					listFilterStatus={this.state.listFilterStatus}
				/>
			</div>
		);
	}
});

var ListContent = React.createClass({
	propTypes: {
		listData: React.PropTypes.array,
		listFilterText: React.PropTypes.string,
		listFilterStatus: React.PropTypes.string,
		listLoaded: React.PropTypes.bool
	},
	getInitialState: function(){
		return {
			batchRendering: true,
			listBegin: 0,
			listEnd: 45
		}
	},
	componentDidMount: function(){
		if(!this.state.batchRendering) return false;

		// This automagically works
		$(window).on('scroll', function(e){
				var scrollBottom = $(window).scrollTop().valueOf() + $(window).height();
				var listItemsOnScreen = window.innerHeight / 46 | 0;
				var listMulti = Math.ceil(scrollBottom / window.innerHeight);
				var listEnd = listItemsOnScreen * listMulti * 1.5;

				if(this.state.listEnd < listEnd || listMulti === 1){
					this.setState({ listEnd: listEnd });
				}
		}.bind(this));
	},
	render: function(){
		var listDOM = [];
		var lastStatus = null;
		var lastStatusCount = 0;
		if(!this.props.listLoaded) return (<div />);
		_.each(this.props.listData, function(listItem){
			var listNode = []; // Current node we are iterating over

			if(
				(this.props.listFilterStatus &&
				this.props.listFilterStatus !== 'all') &&
				this.props.listFilterStatus !== listItem.item_status
			){
				return null;
			}

			// Check if item matches search string, if anys
			if(
				this.props.listFilterText !== '' &&
				listItem.series_title_main.match(new RegExp(this.props.listFilterText, 'gi'))
			){
				listNode.push(<ListItem itemData={listItem} key={listItem._id} />);
			} else if(this.props.listFilterText === ''){
				listNode.push(<ListItem itemData={listItem} key={listItem._id} />);
			}

			if(lastStatus !== listItem.item_status && listNode.length){
				lastStatus = listItem.item_status;
				console.log('sadfdsf');
				lastStatusCount++;
				listDOM.push(
					<div key={listItem._id + '-status'} className={ // FIX: Let this have index as key one _id is used for listItems
						cx({
							'list-itemstatus-wrap': true,
							'current': (lastStatus === 'current') // ?: When index is 0, the current listPart status is "current"
						})
					}>
						<div className="list-itemstatus-tag">
							{lastStatus}
						</div>
						<div className="list-itemstatus-line">
						</div>
					</div>
				)
			}
			if(listNode.length) listDOM.push(listNode);
		}.bind(this));
		return (<div>{listDOM}</div>);
	}
})

var ListItem = React.createClass({
	render: function(){
		return (
			<div className="list-item">{this.props.itemData.series_title_main}</div>
		)
	}
});

var mountNode = document.getElementById('list-left');
if(mountNode) React.renderComponent(<ListApp />, mountNode);