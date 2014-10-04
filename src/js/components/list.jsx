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
				console.log(listStore.length);
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
			listEnd: 40
		}
	},
	componentDidMount: function(){
		if(!this.state.batchRendering) return false;

		// This automagically works
		$(window).on('scroll', function(e){
				var scrollBottom = $(window).scrollTop().valueOf() + $(window).height();
				var listItemsOnScreen = window.innerHeight / 43 | 0;
				var listMulti = Math.ceil(scrollBottom / window.innerHeight);
				var listEnd = listItemsOnScreen * listMulti * 1.5;

				if(this.state.listEnd < listEnd || listMulti === 1){
					console.log(listEnd);
					this.setState({ listEnd: listEnd });
				}
		}.bind(this));
	},
	render: function(){
		var listDOM = [];
		var lastStatus = null;
		var lastStatusCount = 0;
		if(!this.props.listLoaded) return (<div />);
		_.each(this.props.listData, function(listItem, index){
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
		if(this.state.batchRendering && lastStatusCount > 0){
			var listStyle = {
				'padding-bottom': 15,
				'min-height': (listDOM.length - lastStatusCount) * 43
			}
			listDOM = listDOM.slice(0, this.state.listEnd);
		}
		return (<div style={listStyle}>{listDOM}</div>);
	}
})

var ListItem = React.createClass({
	getInitialState: function() {
		return {
			expanded: false,
			showPicker: false
		};
	},
	cancel: function(){
		console.log('No cancelrino');
	},
	saveData: function(data){
		console.log(data);
	},
	toggleExpanded: function(e){
		$(this.refs.listItemExpanded.getDOMNode()).velocity({
			height: (this.state.expanded) ? [0, 280] : [280, 0]
		}, {
			easing: (this.state.expanded) ? [0.165, 0.84, 0.44, 1] : [0.1, 0.885, 0.07, 1.09],
			duration: (this.state.expanded) ? 350 : 500
		});
		
		this.setState({
			expanded: !this.state.expanded,
			showPicker: true
		});
		return false;
	},
	render: function(){
		var listItemStyle = {
			'backgroundImage': 'url(' + this.props.itemData.series_image_reference + ')'
		}
		var listExpPicker = null;
		if(this.state.showPicker){
			listExpPicker = (<PickerApp itemData={this.props.itemData} seriesData={this.props.itemData} onCancel={this.cancel} onSave={this.saveData} />);
		}
		return (
			<div>
				<div className={cx({
					'list-item':  true,
					'expanded': this.state.expanded
				})} onClick={this.toggleExpanded}>
					<div className="list-item-title">
						{this.props.itemData.series_title_main}
					</div>
					<div className="list-item-right">
						<div className="list-item-progress">
							<div className="list-item-progress-sofar">
								{this.props.itemData.item_progress || '—'}
							</div>
							<div className="list-item-progress-sep">
							/
							</div>
							<div className="list-item-progress-total">
								{this.props.itemData.series_episodes_total || '—'}
							</div>
						</div>
						<div className="list-item-rating">
							<div className={
								cx({
									'list-item-rating-icon': true,
									'icon-heart-empty': !this.props.itemData.item_rating,
									'icon-heart-full': this.props.itemData.item_rating
								})
							}></div>
							<div className="list-item-rating-number">
								{(this.props.itemData.item_rating) ? (this.props.itemData.item_rating / 2).toFixed(1) : '—'}
							</div>
						</div>
						<div className="list-item-type">
							{this.props.itemData.series_type}
						</div>
					</div>
				</div>
				<div ref="listItemExpanded" className={
					cx({
						'list-item-expanded': true,
						'visible': this.state.expanded
					})
				} style={listItemStyle}>	
					<div className="list-exp-ovl">
						<div className="list-exp-image" style={listItemStyle}>
						</div>
						<div className="list-exp-picker">
							{listExpPicker}
						</div>
					</div>
				</div>
			</div>
		)
	}
});

var mountNode = document.getElementById('list-left');
if(mountNode) React.renderComponent(<ListApp />, mountNode);