/** @jsx React.DOM */

var listStore = [];
var listAction = {
	updateItem: function(msg, nextData){
		for(var i = 0; i < listStore.length; i++){
			if(listStore[i].seriesTitle === nextData.seriesTitle){
				var beforeData = listStore[i];

				if(beforeData.seriesTotal){ // Else we just have a server-side hard-cap at 9999

					// CASE: If user lower progress, from completed to uncompleted

					if(
						beforeData.itemStatus === 2 &&
						nextData.itemProgress < beforeData.seriesTotal
					){
						nextData.itemStatus = 1;
					}

					// CASE: If user completes an item

					if(nextData.itemProgress === beforeData.seriesTotal){
						nextData.itemStatus = 2;
					}

					// CASE: If user moves an item from x to completed

					if(
						nextData.itemStatus === 2 &&
						nextData.itemProgress < beforeData.seriesTotal
					){
						nextData.itemProgress = beforeData.seriesTotal;
					}

					// CASE: If user moves an item from completed to x

					if(
						nextData.itemStatus !== 2 &&
						nextData.itemProgress === beforeData.seriesTotal
					){
						nextData.itemProgress = 0;
					}
				}

				listStore[i] = nextData;
				PubSub.publish(constants.DATA_CHANGE);
				break;
			}
		}
	}
}

PubSub.subscribe(constants.UPDATE_ITEM, listAction.updateItem);

//?: We load this outside the component for some reason...

$.ajax({
	type: 'get',
	url: '/data/300.json',
	success: function(listData){
		listStore = listData;
		PubSub.publishSync(constants.DATA_CHANGE, listData);
	},
	error: function(){
		PubSub.publishSync(constants.LIST_ERROR);
	}
});

var ReactClassSet = React.addons.classSet;
var ReactTransGroup = React.addons.CSSTransitionGroup;

var listAppComp = React.createClass({
	getInitialState: function(){
		var app = {
			listData: [],
			listFilterText: '',
			listFilterStatus: 0,
			listLoaded: false,
			listLoadError: false,
			listLastSort: 'seriesTitle',
			listLastOrder: 'asc'
		}
		return app;
	},
	shouldComponentUpdate: function(nextProps, nextState){
		// ?: Holy fuck, this should be implemented in React by default.
		if(nextState === this.state) return false;
		return true;
	},
	componentDidMount: function(){
		PubSub.subscribe(constants.DATA_CHANGE, this.loadList);
		PubSub.subscribe(constants.LIST_ERROR, this.loadError);
	},
	loadList: function(msg){
		this.sortList(this.state.listLastSort, this.state.listLastOrder);
		if(!this.state.listLoaded){
			this.setState({
				listLoaded: true
			});
		}
	},
	loadError: function(){
		this.setState({
			listLoaded: true,
			listLoadError: true
		});
	},
	sortList: function(sortBy, order){
		if(!sortBy) sortBy = 'seriesTitle';

		if((this.state.listLastSort === sortBy) && (!order || (typeof order).indexOf('object') > -1)){
			(this.state.listLastOrder === 'asc') ? order = 'desc' : order = 'asc';
		} else if(!order){
			order = 'asc';
		}

		//console.log('Sorting list by "' + sortBy + '" in "' + order + 'ending" order');

		var listSorted = listStore;

		listSorted = keysort(listSorted, 'itemStatus, ' + sortBy + ' ' + order + ', seriesTitle');
		
		this.setState({
			listData: listSorted,
			listLastSort: sortBy,
			listLastOrder: order
		});
	},
	filterList: function(event){
		this.setState({
			listFilterText: event.target.value
		});
	},
	filterStatus: function(status){
		this.setState({
			listFilterStatus: status
		});
	},
	render: function(){
		var divStyle = {
			display: (this.state.listLoaded && this.state.listData.length && !this.state.listLoadError) ? 'block' : 'none'
		}

		if(listStore.length) $('#anime-nav-count').text(listStore.length);

		return (
			<div>
				<div style={divStyle}>
					<div id="list-top">
						<div id="list-tabs-wrap">
							<div className={
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 0)
								})
							} onClick={this.filterStatus.bind(this, 0)}>
								All
							</div>
							<div className={
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 1)
								})
							} onClick={this.filterStatus.bind(this, 1)}>
								Current
							</div>
							<div className={
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 2)
								})
							} onClick={this.filterStatus.bind(this, 2)}>
								Completed
							</div>
							<div className={
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 3)
								})
							} onClick={this.filterStatus.bind(this, 3)}>
								Planned
							</div>
							<div className={
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 4)
								})
							} onClick={this.filterStatus.bind(this, 4)}>
								On Hold
							</div>
							<div className={
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 5)
								})
							} onClick={this.filterStatus.bind(this, 5)}>
								Dropped
							</div>
						</div>
						<div id="list-filter-wrap">
							<input type="text" max-length="50" id="list-filter-input" placeholder="Filter by title..." onChange={this.filterList} />
						</div>
					</div>
					<div id="list-sort">
						<div id="list-sort-title" className="list-sort-hd" onClick={this.sortList.bind(this, 'seriesTitle', null)}>
							Title
						</div>
						<div id="list-sort-progress" className="list-sort-hd" onClick={this.sortList.bind(this, 'itemProgress', null)}>
							Progress
						</div>
						<div id="list-sort-rating" className="list-sort-hd" onClick={this.sortList.bind(this, 'itemRating', null)}>
							Rating
						</div>
						<div id="list-sort-type" className="list-sort-hd" onClick={this.sortList.bind(this, 'seriesType', null)}>
							Type
						</div>
					</div>
				</div>
				<listComp
					listData={this.state.listData}
					listFilterText={this.state.listFilterText}
					listFilterStatus={this.state.listFilterStatus}
					listLoaded={this.state.listLoaded}
					listLoadError={this.state.listLoadError}
				/>
			</div>
		)
	}
});

var listComp = React.createClass({
	propTypes: {
		listData: React.PropTypes.array,
		listFilterText: React.PropTypes.string,
		listLoaded: React.PropTypes.bool,
		listLoadError: React.PropTypes.bool
	},
	getInitialState: function(){
		var comp = {
			/* ?: Enabling hsr (occlusion culling) improves performance by A LOT! 
			However, some flickering might occur, and this option should therefore only
			be used for HUGE lists.

			Alternatively, use the batchRendering option.
			*/
			hsr: false,
			batchRendering: true,
			listBegin: 0,
			listEnd: 44
		}
		return comp;
	},
	mapStatus: function(number){
		var status = [
			undefined,
			'Current',
			'Completed',
			'Planned',
			'On Hold',
			'Dropped'
		]
		return status[number];
	},
	componentDidUpdate: function(){
		console.timeEnd('listComp');
	},
	componentDidMount: function(){
		if(this.state.hsr){
			$(window).on('scroll', function(e){
				var scrollTop = $(window).scrollTop() - $('#list-hsr').offset().top;
				if(scrollTop < 0) scrollTop = 0;

				var listItemHeight = 43; // ?: 43px
				var listItemOnScreen = window.innerHeight / listItemHeight | 0;
				var listBegin = (scrollTop / listItemHeight | 0);
				var listEnd = listBegin + listItemOnScreen + 5;

				this.setState({
					listBegin: listBegin,
					listEnd: listEnd
				});

				console.log('Begin: ' + listBegin + ' End: ' + listEnd);
			}.bind(this));
		} else if(this.state.batchRendering){
			$(window).on('scroll', function(e){
				var scrollBottom = $(window).scrollTop().valueOf() + $(window).height();
				var listItemsOnScreen = window.innerHeight / 43 | 0;
				var listMulti = Math.ceil(scrollBottom / window.innerHeight);
				var listEnd = listItemsOnScreen * listMulti * 1.5;

				if(this.state.listEnd < listEnd || listMulti === 1){
					this.setState({ listEnd: listEnd });
				}
			}.bind(this));	
		}
	},
	render: function(){
		var listDOM = [];
		var ifListLoaded = (this.props.listLoaded && !this.props.listLoadError);
		var ifListEmpty = (ifListLoaded && this.props.listFilterText !== '');
		var ifListError = (this.props.listLoaded && this.props.listLoadError);
		var ifListOnBoard = (ifListLoaded && !this.props.listData.length && !this.props.listLoadError);
		var lastStatus = null;
		var lastStatusCount = 0; // ?: Could how many status bars we add
		console.time('listComp');
		if(ifListLoaded){
			_.each(this.props.listData, function(listItem, index){
				var listNode = [];
				var filterStatus = this.props.listFilterStatus
				if(filterStatus && filterStatus !== listItem.itemStatus){
					return null;
				}

				if(this.props.listFilterText !== ''){
					var filterText = this.props.listFilterText;
					var filterCondition = (
						listItem.seriesTitle.toLowerCase().indexOf(filterText) > -1
						|| listItem.seriesType.toLowerCase().indexOf(filterText) > -1
					); 
					
					if(filterCondition){
						listNode.push(<listItemComp itemData={listItem} key={index + '-item'} />);
					}	
				} else {
					listNode.push(<listItemComp itemData={listItem} key={index + '-item'} />);
				}

				if(lastStatus !== listItem.itemStatus && listNode.length){
					lastStatus = listItem.itemStatus;
					lastStatusCount++;
					listDOM.push(
						<div key={index + '-status'} className={ // FIX: Let this have index as key one _id is used for listItems
							ReactClassSet({
								'list-itemstatus-wrap': true,
								'current': (lastStatus === 2) // ?: When index is 0, the current listPart status is "current"
							})
						}>
							<div className="list-itemstatus-tag">
								{this.mapStatus(lastStatus)}
							</div>
							<div className="list-itemstatus-line">
							</div>
						</div>
					)
				}
				if(listNode.length)	listDOM.push(listNode); // ?: This has to come after the status header
			}.bind(this));
		}

		if(ifListEmpty && !listDOM.length){
			listDOM.push(<div id="list-noresults">No matching entries were found</div>);
		} else if(ifListError){
			listDOM.push(<listError />);
		} else if(ifListOnBoard){
			listDOM.push(<listOnBoard />);
		}

		if((this.state.hsr || this.state.batchRendering) && lastStatusCount > 0){
			var listStyle = {
				'padding-bottom': 15,
				'height': (listDOM.length - lastStatusCount) * 43
			}
			listDOM = listDOM.slice(0, this.state.listEnd);
		}

		return (
			<div id="list-hsr" style={listStyle}>
				{listDOM}
			</div>
		);
	}
});

var listItemComp = React.createClass({
	propTypes: {
		itemData: React.PropTypes.object,
		itemIndex: React.PropTypes.number
	},
	getInitialState: function(){
		return {
			loadPickers: false,
			ratingOpen: false,
			progressOpen: false
		}
	},
	incrementProgress: function(){
		var tempItem = _.clone(this.props.itemData);
		tempItem.itemProgress += 1;
		PubSub.publish(constants.UPDATE_ITEM, tempItem);
	},
	open: function(picker, e){
		if(this.state.ratingOpen && this.state.progressOpen) return false;
		var ops = {};
		ops[picker] = true;
		this.setState(ops);
	},
	close: function(picker, e){
		if(!this.state.ratingOpen && !this.state.progressOpen) return false;
		var ops = {};
		ops[picker] = false;
		this.setState(ops);
	},
	loadPickers: function(){
		if(!this.state.loadPickers) this.setState({ loadPickers: true });
	},
	render: function(){
		// WORK: Not sure if we need to pass e.g. prevRating and itemData props (combine them)
		var pickerProgress = null;
		var pickerRating = null;

		if(this.state.loadPickers){
			// ?: Load these onMouseEnter (see below), 
			// which improves the inital load + sorting by 100%~

			pickerProgress = (<pickerProgressComp 
								visible={this.state.progressOpen}
								itemData={this.props.itemData}
								close={this.close.bind(this, 'progressOpen')}
							/>);

			pickerRating = (<pickerRatingComp
								visible={this.state.ratingOpen}
								close={this.close.bind(this, 'ratingOpen')}
								itemData={this.props.itemData}
								prevRating={this.props.itemData.itemRating}
							/>);
		}

		return (
			<div className="list-item">
				<div className="list-item-content">
					<div className="list-item-left">
						<a className="list-item-title" href="/">
							{this.props.itemData.seriesTitle}
						</a>
					</div>
					<div className="list-item-right">
						<div className={
							ReactClassSet({
								'list-item-plusone': true,
								'icon-plus': true,
								'hidden': (this.props.itemData.itemStatus === 2) // ?: Hide the 'plus-one' button if list item is under 'completed'
							})
						} onClick={this.incrementProgress}>
						</div>
						<div 
							className="list-item-progress"
							onClick={this.open.bind(this, 'progressOpen')}
							onMouseEnter={this.loadPickers}
						>
							<span className="list-progress-current">
								{
									(this.props.itemData.itemProgress) ? this.props.itemData.itemProgress : '—'
								}
							</span>
							<span className="list-progress-sep">/</span>
							<span className="list-progress-total">
								{
									(this.props.itemData.seriesTotal) ? this.props.itemData.seriesTotal : '—'
								}
							</span>
							{
								pickerProgress
							}
						</div>
						<div
							className="list-item-rating"
							onClick={this.open.bind(this, 'ratingOpen')}
							onMouseEnter={this.loadPickers}
							onMouseLeave={this.close.bind(this, 'ratingOpen')}
						>
							<span className={
								ReactClassSet({
									"list-rating-icon": true,
									"icon-heart-full": this.props.itemData.itemRating,
									"icon-heart-empty": !this.props.itemData.itemRating
								})
							}></span>
							<span className="list-rating-number">
								{
									(this.props.itemData.itemRating) ? this.props.itemData.itemRating / 2 : '—' // ?: Divide score by two, or display m-dash
								}
							</span>
							{
								pickerRating
							}
						</div>
						<div className="list-item-type">
							<span className="list-type-icon tv">{this.props.itemData.seriesType}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

var listError = React.createClass({
	render: function(){
		return (
			<div id="list-error">
				<div id="list-error-image" className="icon-support">
				</div>
				<div id="list-error-title">
					Sorry! Herro is experiencing some problems.
				</div>
				<p id="list-error-desc">
					We are already on the case and will resolve this issue as soon as possible.
					Feel free to contact us if this issue persists.
				</p>
			</div>
		)
	}
});

var listOnBoard = React.createClass({
	render: function(){
		return (
			<div id="list-onboard">
				<div id="onboard-welcome">
					Let's get started quickly.
				</div>
				<div id="onboard-wrap">
					<div id="onboard-left" className="onboard-option">
						<div className="onboard-image icon-book-2">
						</div>
						<div className="onboard-title">
							Start adding entries to a new list
						</div>
						<div className="onboard-desc">
							Super easy to do. We'll help you get started with tracking your favorite series in no time!
						</div>
						<a id="onboard-btn-new" className="onboard-btn">
							Start with fresh list
						</a>
					</div>
					<div id="onboard-sep">
					</div>
					<div id="onboard-right" className="onboard-option">
						<div className="onboard-image icon-book-lines-2">
						</div>
						<div className="onboard-title">
							Sync with an already existing list
						</div>
						<div className="onboard-desc">
							If you already have a list, we can help you keep 
							things synced across platforms.
							<br />
							<span className="onboard-tiny">
								(even if you never ever will use something besides Herro....right?)
							</span>
						</div>
						<a id="onboard-btn-sync" className="onboard-btn">
							Sync from old list
						</a>
					</div>
				</div>
			</div>
		)
	}
});

React.renderComponent(<listAppComp />, document.getElementById('list-left'));