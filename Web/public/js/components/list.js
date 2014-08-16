/** @jsx React.DOM */

var listStore = [];
var listAction = {
	updateItem: function(msg, nextData){
		for(var i = 0; i < listStore.length; i++){
			if(listStore[i].seriesTitle === nextData.seriesTitle){
				var prevData = listStore[i];

				if(prevData.seriesTotal > 0){ // Else we just have a server-side hard-cap at 9999

					// CASE: If user lower progress, from completed to uncompleted

					if(
						prevData.itemStatus === 2 &&
						nextData.itemProgress < prevData.seriesTotal
					){
						nextData.itemStatus = 1;
					}

					// CASE: If user completes an item

					if(nextData.itemProgress === prevData.seriesTotal){
						nextData.itemStatus = 2;
					}

					// CASE: If user moves an item from x to completed

					if(
						nextData.itemStatus === 2 &&
						nextData.itemProgress < prevData.seriesTotal
					){
						nextData.itemProgress = prevData.seriesTotal;
					}

					// CASE: If user moves an item from completed to x

					if(
						nextData.itemStatus !== 2 &&
						nextData.itemProgress === prevData.seriesTotal
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

var listAppComp = React.createClass({displayName: 'listAppComp',
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
			React.DOM.div(null, 
				React.DOM.div({style: divStyle}, 
					React.DOM.div({id: "list-top"}, 
						React.DOM.div({id: "list-tabs-wrap"}, 
							React.DOM.div({className: 
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 0)
								}), 
							onClick: this.filterStatus.bind(this, 0)}, 
								"All"
							), 
							React.DOM.div({className: 
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 1)
								}), 
							onClick: this.filterStatus.bind(this, 1)}, 
								"Current"
							), 
							React.DOM.div({className: 
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 2)
								}), 
							onClick: this.filterStatus.bind(this, 2)}, 
								"Completed"
							), 
							React.DOM.div({className: 
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 3)
								}), 
							onClick: this.filterStatus.bind(this, 3)}, 
								"Planned"
							), 
							React.DOM.div({className: 
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 4)
								}), 
							onClick: this.filterStatus.bind(this, 4)}, 
								"On Hold"
							), 
							React.DOM.div({className: 
								ReactClassSet({
									'list-tab': true,
									'current': (this.state.listFilterStatus === 5)
								}), 
							onClick: this.filterStatus.bind(this, 5)}, 
								"Dropped"
							)
						), 
						React.DOM.div({id: "list-filter-wrap"}, 
							React.DOM.input({type: "text", 'max-length': "50", id: "list-filter-input", placeholder: "Filter by title...", onChange: this.filterList})
						)
					), 
					React.DOM.div({id: "list-sort"}, 
						React.DOM.div({id: "list-sort-title", className: "list-sort-hd", onClick: this.sortList.bind(this, 'seriesTitle', null)}, 
							"Title"
						), 
						React.DOM.div({id: "list-sort-progress", className: "list-sort-hd", onClick: this.sortList.bind(this, 'itemProgress', null)}, 
							"Progress"
						), 
						React.DOM.div({id: "list-sort-rating", className: "list-sort-hd", onClick: this.sortList.bind(this, 'itemRating', null)}, 
							"Rating"
						), 
						React.DOM.div({id: "list-sort-type", className: "list-sort-hd", onClick: this.sortList.bind(this, 'seriesType', null)}, 
							"Type"
						)
					)
				), 
				listComp({
					listData: this.state.listData, 
					listFilterText: this.state.listFilterText, 
					listFilterStatus: this.state.listFilterStatus, 
					listLoaded: this.state.listLoaded, 
					listLoadError: this.state.listLoadError}
				)
			)
		)
	}
});

var listComp = React.createClass({displayName: 'listComp',
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

				var listItemHeight = 46;
				var listItemOnScreen = window.innerHeight / listItemHeight | 0;
				var listBegin = (scrollTop / listItemHeight | 0);
				var listEnd = listBegin + listItemOnScreen + 5;

				this.setState({
					listBegin: listBegin,
					listEnd: listEnd
				});
			}.bind(this));
		} else if(this.state.batchRendering){
			$(window).on('scroll', function(e){
				var scrollBottom = $(window).scrollTop().valueOf() + $(window).height();
				var listItemsOnScreen = window.innerHeight / 46 | 0;
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
						listNode.push(listItemComp({itemData: listItem, key: listItem.seriesTitle + '-item'}));
					}	
				} else {
					listNode.push(listItemComp({itemData: listItem, key: listItem.seriesTitle + '-item'}));
				}

				if(lastStatus !== listItem.itemStatus && listNode.length){
					lastStatus = listItem.itemStatus;
					lastStatusCount++;
					listDOM.push(
						React.DOM.div({key: index + '-status', className:  // FIX: Let this have index as key one _id is used for listItems
							ReactClassSet({
								'list-itemstatus-wrap': true,
								'current': (lastStatus === 2) // ?: When index is 0, the current listPart status is "current"
							})
						}, 
							React.DOM.div({className: "list-itemstatus-tag"}, 
								this.mapStatus(lastStatus)
							), 
							React.DOM.div({className: "list-itemstatus-line"}
							)
						)
					)
				}
				if(listNode.length)	listDOM.push(listNode); // ?: This has to come after the status header
			}.bind(this));
		}

		if(ifListEmpty && !listDOM.length){
			listDOM.push(React.DOM.div({id: "list-noresults"}, "No matching entries were found"));
		} else if(ifListError){
			listDOM.push(listError(null));
		} else if(ifListOnBoard){
			listDOM.push(listOnBoard(null));
		}

		if((this.state.hsr || this.state.batchRendering) && lastStatusCount > 0){
			var listStyle = {
				'padding-bottom': 15,
				'height': (listDOM.length - lastStatusCount) * 46
			}
			listDOM = listDOM.slice(0, this.state.listEnd);
		}

		return (
			React.DOM.div({id: "list-hsr", style: listStyle}, 
				listDOM
			)
		);
	}
});

var listItemComp = React.createClass({displayName: 'listItemComp',
	propTypes: {
		itemData: React.PropTypes.object,
		itemIndex: React.PropTypes.number
	},
	getInitialState: function(){
		return {
			loadPickers: false,
			ratingOpen: false,
			progressOpen: false,
			expanded: false
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
		var ops = { expanded: true };
		ops[picker] = false;
		this.setState(ops);
	},
	loadPickers: function(){
		if(!this.state.loadPickers) this.setState({ loadPickers: true });
	},
	toggleExpand: function(e){
		if(!e || e.target.className.indexOf('list-item-content') > -1){
			$(this.refs.itemExpandContent.getDOMNode()).velocity('stop', true).velocity({
				opacity: (this.state.expanded) ? 0 : 1,
				paddingTop: (this.state.expanded) ? 0 : '15px'
			}, {
				delay: (this.state.expanded) ? 0 : 150,
				duration: (this.state.expanded) ? 200 : 450,
				easing: [0.165, 0.84, 0.44, 1],
				queue: false
			});

			$(this.refs.itemExpand.getDOMNode()).velocity('stop', true).velocity({
				height: (this.state.expanded) ? 0 : '230px'
			}, {
				duration: (this.state.expanded) ? 200 : 400,
				easing: (this.state.expanded) ? [0.645, 0.045, 0.355, 1] : [0.1, 0.885, 0.07, 1.09],
				queue: false
			}).velocity({
				backgroundPositionY: (this.state.expanded) ? '50%' : '40%'
			}, {
				duration: 600,
				easing: [0.165, 0.84, 0.44, 1],
				queue: false
			});
			this.setState({
				expanded: !this.state.expanded
			});
		}
	},
	render: function(){
		// WORK: Not sure if we need to pass e.g. prevRating and itemData props (combine them)
		var pickerProgress = null;
		var pickerRating = null;

		if(this.state.loadPickers){
			// ?: Load these onMouseEnter (see below), 
			// which improves the inital load + sorting by 100%~

			pickerProgress = (pickerProgressComp({
								visible: this.state.progressOpen, 
								itemData: this.props.itemData, 
								close: this.close.bind(this, 'progressOpen')}
							));

			pickerRating = (pickerRatingComp({
								visible: this.state.ratingOpen, 
								close: this.close.bind(this, 'ratingOpen'), 
								itemData: this.props.itemData, 
								prevRating: this.props.itemData.itemRating}
							));
		}

		return (
			React.DOM.div({className: "list-item"}, 
				React.DOM.div({className: "list-item-icons"}, 
					React.DOM.div({className: "icon-podcast-2 list-item-airing-icon"}
					), 
					React.DOM.div({className: "icon-tag list-item-tag-icon"}
					)
				), 
				React.DOM.div({className: "list-item-content", onClick: this.toggleExpand}, 
					React.DOM.div({className: "list-item-left"}, 
						React.DOM.a({className: "list-item-title", href: "/"}, 
							this.props.itemData.seriesTitle
						)
					), 
					React.DOM.div({className: "list-item-right"}, 
						React.DOM.div({className: 
							ReactClassSet({
								'list-item-plusone': true,
								'icon-plus': true,
								'hidden': (this.props.itemData.itemStatus === 2) // ?: Hide the 'plus-one' button if list item is under 'completed'
							}), 
						onClick: this.incrementProgress}
						), 
						React.DOM.div({
							className: "list-item-progress", 
							onClick: this.open.bind(this, 'progressOpen'), 
							onMouseEnter: this.loadPickers
						}, 
							React.DOM.span({className: "list-progress-current"}, 
								
									(this.props.itemData.itemProgress) ? this.props.itemData.itemProgress : '—'
								
							), 
							React.DOM.span({className: "list-progress-sep"}, "/"), 
							React.DOM.span({className: "list-progress-total"}, 
								
									(this.props.itemData.seriesTotal) ? this.props.itemData.seriesTotal : '—'
								
							), 
							
								pickerProgress
							
						), 
						React.DOM.div({
							className: "list-item-rating", 
							onClick: this.open.bind(this, 'ratingOpen'), 
							onMouseEnter: this.loadPickers, 
							onMouseLeave: this.close.bind(this, 'ratingOpen')
						}, 
							React.DOM.span({className: 
								ReactClassSet({
									"list-rating-icon": true,
									"icon-heart-full": this.props.itemData.itemRating,
									"icon-heart-empty": !this.props.itemData.itemRating
								})
							}), 
							React.DOM.span({className: "list-rating-number"}, 
								
									(this.props.itemData.itemRating) ? this.props.itemData.itemRating / 2 : '—'// ?: Divide score by two, or display m-dash
								
							), 
							
								pickerRating
							
						), 
						React.DOM.div({className: "list-item-type"}, 
							React.DOM.span({className: "list-type-icon tv"}, this.props.itemData.seriesType)
						)
					)
				), 
				React.DOM.div({className: "list-item-exp", ref: "itemExpand"}, 
					React.DOM.div({className: "list-exp-content-wrap"}, 
						React.DOM.div({className: "list-exp-content", ref: "itemExpandContent"}, 
							React.DOM.div({className: "list-exp-image"}
							), 
							React.DOM.div({className: "list-exp-general"}, 
								React.DOM.div({className: "list-exp-title"}, 
									"Sword Art Online"
								), 
								React.DOM.div({className: "list-exp-desc"}, 
									"In the near future, a Virtual Reality Massive Multiplayer Online Role-Playing Game (VRMMORPG) called Sword Art Online has been released where players control their avatars with their bodies using a piece of technology called: Nerve Gear. One day, players discover they cannot log out, as the game creator is holding them captive unless they reach the 100th floor of the game's tower and defeat the final boss. However, if they die in the game, they die in real life. Their struggle for survival starts now..."
								)
							)
						)
					)
				)
			)
		);
	}
});

var listError = React.createClass({displayName: 'listError',
	render: function(){
		return (
			React.DOM.div({id: "list-error"}, 
				React.DOM.div({id: "list-error-image", className: "icon-support"}
				), 
				React.DOM.div({id: "list-error-title"}, 
					"Sorry! Herro is experiencing some problems."
				), 
				React.DOM.p({id: "list-error-desc"}, 
					"We are already on the case and will resolve this issue as soon as possible." + ' ' +
					"Feel free to contact us if this issue persists."
				)
			)
		)
	}
});

var listOnBoard = React.createClass({displayName: 'listOnBoard',
	render: function(){
		return (
			React.DOM.div({id: "list-onboard"}, 
				React.DOM.div({id: "onboard-welcome"}, 
					"Let's get started quickly."
				), 
				React.DOM.div({id: "onboard-wrap"}, 
					React.DOM.div({id: "onboard-left", className: "onboard-option"}, 
						React.DOM.div({className: "onboard-image icon-book-2"}
						), 
						React.DOM.div({className: "onboard-title"}, 
							"Start adding entries to a new list"
						), 
						React.DOM.div({className: "onboard-desc"}, 
							"Super easy to do. We'll help you get started with tracking your favorite series in no time!"
						), 
						React.DOM.a({id: "onboard-btn-new", className: "onboard-btn"}, 
							"Start with fresh list"
						)
					), 
					React.DOM.div({id: "onboard-sep"}
					), 
					React.DOM.div({id: "onboard-right", className: "onboard-option"}, 
						React.DOM.div({className: "onboard-image icon-book-lines-2"}
						), 
						React.DOM.div({className: "onboard-title"}, 
							"Sync with an already existing list"
						), 
						React.DOM.div({className: "onboard-desc"}, 
							"If you already have a list, we can help you keep" + ' ' + 
							"things synced across platforms.", 
							React.DOM.br(null), 
							React.DOM.span({className: "onboard-tiny"}, 
								"(even if you never ever will use something besides Herro....right?)"
							)
						), 
						React.DOM.a({id: "onboard-btn-sync", className: "onboard-btn"}, 
							"Sync from old list"
						)
					)
				)
			)
		)
	}
});

React.renderComponent(listAppComp(null), document.getElementById('list-left'));