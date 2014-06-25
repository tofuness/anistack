/** @jsx React.DOM */

var listApp = React.createClass({
	getInitialState: function(){
		/*
			1 - current
			2 - completed
			3 - planned
			4 - on hold
			5 - dropped
		*/
		var user = {
			username: 'Mochi Umai',
			biography: 'Everything from code to pancakes. Solving the mysteries of design.',
			animeList: [
				{
					title: 'Spice & Wolf',
					total: 12,
					type: 'TV',
					progress: 6,
					rating: 9,
					status: 1
				},
				{
					title: 'Yumekui Merry',
					total: 12,
					type: 'TV',
					progress: 12,
					rating: 8,
					status: 2
				},
				{
					title: 'Kill la Kill',
					total: 24,
					type: 'TV',
					progress: 24,
					rating: 7,
					status: 2
				},
				{
					title: 'Sket Dance',
					total: 43,
					type: 'TV',
					progress: 2,
					rating: 2,
					status: 4
				}
			],
			mangaList: []
		}
		return user;
	},
	sortList: function(sortBy){
		if(this.props.listType === 'anime'){
			var animeList = this.state.animeList;
			if(!sortBy) sortBy = 'title';
			animeList.sort(function(a, b){
				if(a.status === b.status){
					return (a[sortBy] > b[sortBy]) ? true : false;
				} else {
					return (a.status > b.status) ? true : false;
				}
			});
		}

		this.setState({ animeList: animeList });
	},
	// THIS HAS TO BE DRIER
	sortByTitle: function(){
		this.sortList();
	},
	sortByProgress: function(){
		this.sortList('progress');
	},
	sortByRating: function(){
		this.sortList('rating');
	},
	sortByType: function(){
		this.sortList('type');
	},
	componentWillMount: function(){
		this.sortList();
	},
	render: function(){
		return (
			<div>
				<div id="list-left">
					<div id="list-top">
						<div id="list-filter-wrap">
							<input type="text" max-length="50" id="list-filter-input" placeholder="Filter by title..." />
						</div>
					</div>
					<div id="list-sort">
						<div id="list-sort-title" className="list-sort-hd" onClick={this.sortByTitle}>
							Title
						</div>
						<div id="list-sort-progress" className="list-sort-hd" onClick={this.sortByProgress}>
							Progress
						</div>
						<div id="list-sort-rating" className="list-sort-hd" onClick={this.sortByRating}>
							Rating
						</div>
						<div id="list-sort-type" className="list-sort-hd" onClick={this.sortByType}>
							Type
						</div>
					</div>
					<list list={this.state.animeList} />
				</div>
				<div id="list-right">
					<div id="list-profile">
						<div id="list-profile-background">
						</div>
						<div id="list-profile-avatar">
						</div>
						<div id="list-profile-name">
							{this.state.username}
						</div>
						<div id="list-profile-bio">
							<p>
								{this.state.biography}
							</p>
						</div>
					</div>
					<div className="list-nav">
						<a className="list-nav-item current">
							<span className="list-nav-text">
								Anime List
							</span>
							<span className="list-nav-count">
								{this.state.animeList.length}
							</span>
						</a>
						<a className="list-nav-item">
							<span className="list-nav-text">
								Manga List
							</span>
							<span className="list-nav-count">
								158
							</span>
						</a>
						<a className="list-nav-item">
							<span className="list-nav-text">
								Stats
							</span>
						</a>
					</div>
				</div>
			</div>
		);
	}
});
var list = React.createClass({
	mapStatus: function(statusValue){
		var statusList = [
			undefined,
			'Current',
			'Completed',
			'Planned',
			'On hold',
			'Dropped'
		];

		return statusList[statusValue];
	},
	render: function(){
		var lastStatus = 0;
		return (
			<div id="list">
				{	
					this.props.list.map(function(item, i){
						if(lastStatus != item.status){
							lastStatus = item.status;
							return (
								<div key={i}>
									<div className={
										React.addons.classSet({
											'list-itemstatus-wrap': true,
											'current': (lastStatus === 1)
										})
									}>
										<div className="list-itemstatus-tag">
											{this.mapStatus(lastStatus)}
										</div>
										<div className="list-itemstatus-line">
										</div>
									</div>
									<listItem item={item} />
								</div>
							);
						} else {
							return (<div key={i}><listItem item={item} /></div>);
						}
					}.bind(this))
				}
			</div>
		)
	}
});

var listItem = React.createClass({
	updateProgress: function(){

	},
	render: function(){
		return (
			<div className="list-item">
				<div className="list-item-content">
					<div className="list-item-left">
						<div className="list-item-title">
							{this.props.item.title}
						</div>
					</div>
					<div className="list-item-right">
						<div className={
							React.addons.classSet({
								'list-item-plusone': true,
								'icon-plus': true,
								'hidden': (this.props.item.status === 2)
							})
						} onClick={this.updateProgress}>
						</div>
						<div className="list-item-progress">
							<span className="list-progress-current">{this.props.item.progress}</span>
							<span className="list-progress-sep">/</span>
							<span className="list-progress-total">{this.props.item.total}</span>
						</div>
						<div className="list-item-rating">
							<span className="list-rating-icon icon-heart-full"></span>
							<span className="list-rating-number">
								{
									(this.props.item.rating) ? this.props.item.rating / 2 : '&mdash;'
								}
							</span>
						</div>
						<div className="list-item-type">
							<span className="list-type-icon tv">{this.props.item.type}</span>
						</div>
					</div>
				</div>
				<div className="list-item-expanded">
				</div>
			</div>
		)
	}
});
React.renderComponent(<listApp listType="anime" />, document.getElementById('list-wrap'));

/*
	<div id="list-wrap">
		<div id="boo-progress" class="boo-container">
			<div class="boo-content">
				<input type="text" id="boo-progress-input" value="" autocomplete="off" />
			</div>
		</div>
		<div id="list-left">
			<div id="list-top">
				<div id="list-filter-wrap">
					<input type="text" max-length="50" id="list-filter-input" placeholder="Filter by title..." />
				</div>
				<div id="list-add-wrap">
					<div id="list-add-btn">
						Add Series
					</div>
				</div>
			</div>
			<div id="list-sort">
				<div id="list-sort-title" class="list-sort-hd">
					Title
				</div>
				<div id="list-sort-progress" class="list-sort-hd">
					Progress
				</div>
				<div id="list-sort-rating" class="list-sort-hd">
					Rating
				</div>
				<div id="list-sort-type" class="list-sort-hd">
					Type
				</div>
			</div>
			<div id="list">
				<div class="list-itemstatus-wrap current">
					<div class="list-itemstatus-tag">
						Current
					</div>
					<div class="list-itemstatus-line">
					</div>
				</div>
				<div class="list-item">
					<div class="list-item-content">
						<div class="list-item-left">
							<div class="list-item-title">
								Mikakunin De Shinkoukei
							</div>
						</div>
						<div class="list-item-right">
							<div class="list-item-plusone icon-plus">
							</div>
							<div class="list-item-progress">
								<span class="list-progress-current">6</span>
								<span class="list-progress-sep">/</span>
								<span class="list-progress-total">12</span>
							</div>
							<div class="list-item-rating">
								<span class="list-rating-icon icon-heart-empty"></span>
								<span class="list-rating-number">&mdash;</span>
							</div>
							<div class="list-item-type">
								<span class="list-type-icon tv">Special</span>
							</div>
						</div>
					</div>
					<div class="list-item-expanded">
					</div>
				</div>
				<div class="list-itemstatus-wrap">
					<div class="list-itemstatus-tag">
						Completed
					</div>
					<div class="list-itemstatus-line">
					</div>
				</div>
			</div>
		</div>

	</div> */