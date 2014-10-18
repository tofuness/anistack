var cx = React.addons.classSet;
var Settings = React.createClass({
	getInitialState: function(){
		return {
			tab: $('#settings').data('tab') || 'basic',
			user: {},
			loaded: false
		};
	},
	componentDidMount: function(){
		$.ajax({
			url: '/api/settings',
			success: function(user){
				this.setState({
					user: user,
					loaded: true
				});
				this.animateInForm();
			}.bind(this)
		});
	},
	animateInForm: function(){
		$(this.refs.settingsRight.getDOMNode()).find('.visible .set-section').stop(true).velocity('herro.slideUpIn', {
			duration: 500,
			stagger: 100
		});
	},
	setTab: function(tabVal){
		this.setState({
			tab: tabVal
		});
	},
	componentDidUpdate: function(prevProps, prevState){
		if(this.state.tab !== prevState.tab){
			this.animateInForm();
		}
	},
	render: function(){
		if(!this.state.loaded) return false;
		return (
			<div>
				<div id="settings-left">
					<div id="settings-hd">
						Settings
					</div>
					<div id="settings-tagline">
						Do not forget to save
					</div>
					<div id="settings-tabs">
						{
							['Basic', 'Password', 'Privacy'].map(function(tabName){
								return (
								<div className={cx({
									'setting-tab': true,
									'current': this.state.tab === tabName.toLowerCase()
								})} onClick={this.setTab.bind(null, tabName.toLowerCase())}>
									{tabName}
								</div>);
							}.bind(this))
						}
					</div>
				</div>
				<div id="settings-right" ref="settingsRight">
					<div className={
						cx({
							'setting-tab-content': true,
							'visible': this.state.tab === 'basic'
						})
					}>
						<BasicSettings user={this.state.user} />
					</div>
					<div className={
						cx({
							'setting-tab-content': true,
							'visible': this.state.tab === 'password'
						})
					}>
						<PasswordSettings user={this.state.user} />
					</div>
					<div className={
						cx({
							'setting-tab-content': true,
							'visible': this.state.tab === 'privacy'
						})
					}>
						<PrivacySettings user={this.state.user} />
					</div>
				</div>
			</div>
		);
	}
});

var BasicSettings = React.createClass({
	saveChanges: function(){
		$.ajax({
			url: '/api/settings/basic',
			type: 'POST',
			data: $(this.refs.setForm.getDOMNode()).serialize(),
			success: function(){
				window.location = '/me/settings/basic';
			},
			error: function(){
				alert('Make sure you email is correct (and not already in use)!');
			}
		});
	},
	render: function(){
		return (
			<div>
				<form className="set-form" ref="setForm">
					<div className="set-section">
						<div className="set-left">
							<div className="set-title">Email address</div>
							<div className="set-desc">Used for account recovery and anime/manga notifications.</div>
						</div>
						<div className="set-right">
							<input className="set-input" name="email" type="text" defaultValue={this.props.user.email} />
						</div>
					</div>
					<div className="set-section">
						<div className="set-left">
							<div className="set-title">Avatar</div>
							<div className="set-desc">
								Simply give us an <a href="http://imgur.com" rel="nofollow" target="_blank">Imgur</a> link to
								your avatar and let us handle the rest.
								<br /><br />
								(Suggested: 250 &times; 250 pixels)
							</div>
						</div>
						<div className="set-right">
							<input
								className="set-input"
								name="avatar"
								type="text"
								placeholder="Imgur link to new avatar..."
							/>
							<div className="set-avatar-preview-wrap">
								<img
									src={this.props.user.avatar ? 'https://images.weserv.nl/?w=250&h=250&t=squaredown&url=' + this.props.user.avatar.original : 'http://i.imgur.com/siaPoHT.png'}
									className="set-avatar" 
								/>
							</div>
						</div>
					</div>
					<div className="set-section">
						<div className="set-left">
							<div className="set-title">Biography</div>
							<div className="set-desc">Short text about yourself.</div>
						</div>
						<div className="set-right">
							<textarea className="set-textarea" rows="5" name="biography" type="text" defaultValue={this.props.user.biography}></textarea>
						</div>
					</div>
					<div className="set-section">
						<div className="set-save-wrap">
							<div className="set-save" onClick={this.saveChanges}>
								Save changes
							</div>
						</div>
					</div>
				</form>
			</div>
		);
	}
});

var PasswordSettings = React.createClass({
	saveChanges: function(){
		$.ajax({
			url: '/api/settings/password',
			type: 'POST',
			data: $(this.refs.setForm.getDOMNode()).serialize(),
			success: function(){
				window.location = '/me/settings/password';
			},
			error: function(){
				alert('Make sure the inputs are correct!');
			}
		});
	},
	render: function(){
		return (
			<div>
				<form className="set-form" ref="setForm">
					<div className="set-section">
						<div className="set-left">
							<div className="set-title">Old Password</div>
							<div className="set-desc">Just to confirm that it is you.</div>
						</div>
						<div className="set-right">
							<input className="set-input" name="old_password" type="password" />
						</div>
					</div>
					<div className="set-section">
						<div className="set-left">
							<div className="set-title">New Password</div>
							<div className="set-desc">
								Has to be <em>at least</em> 6 characters long.
								<br /><br />
								PROTIP: Do <em>NOT</em> use the same password on other services.
							</div>
						</div>
						<div className="set-right">
							<input className="set-input" name="new_password" type="password" />
						</div>
					</div>
					<div className="set-section">
						<div className="set-save-wrap">
							<div className="set-save" onClick={this.saveChanges}>
								Save changes
							</div>
						</div>
					</div>
				</form>
			</div>
		)
	}
});

var PrivacySettings = React.createClass({
	getInitialState: function(){
		return {
			anime_list_private: false,
			manga_list_private: false,
			collections_private: false,
			stats_private: false
		}
	},
	componentDidMount: function() {
		if(this.props.user && this.props.user.settings){
			console.log(this.props.user.settings);
			this.setState({
				anime_list_private: this.props.user.settings.anime_list_private,
				manga_list_private: this.props.user.settings.manga_list_private,
				collections_private: this.props.user.settings.collections_private,
				stats_private: this.props.user.settings.stats_private
			});
		}
	},
	toggleCheckbox: function(checkboxVal){
		var checkObj = {};
		checkObj[checkboxVal] = !this.state[checkboxVal];
		this.setState(checkObj);
	},
	saveChanges: function(){
		$.ajax({
			url: '/api/settings/privacy',
			type: 'POST',
			data: this.state,
			success: function(){
				window.location = '/me/settings/privacy';
			},
			error: function(){
				alert('Something seems to be wrong on our end');
			}
		});
	},
	render: function(){
		return (
			<form className="set-form" ref="setForm">
				<div className="set-section">
					<div className="set-left">
						<div className="set-title">Protect anime list</div>
						<div className="set-desc">Make your anime list private.</div>
					</div>
					<div className="set-right">
						<div className={
							cx({
								'set-check': true,
								'private': this.state.anime_list_private
							})
						}>
							<input type="checkbox" className="set-checkbox" id="anime_list_private" name="anime_list_private" checked={this.state.anime_list_private} onChange={this.toggleCheckbox.bind(null, 'anime_list_private')} />
							<label className="set-check-label" htmlFor="anime_list_private">
								{this.state.anime_list_private ? 'Private' : 'Public'}
							</label>
						</div>
					</div>
				</div>
				<div className="set-section">
					<div className="set-left">
						<div className="set-title">Protect manga list</div>
						<div className="set-desc">Make your manga list private.</div>
					</div>
					<div className="set-right">
						<div className={
							cx({
								'set-check': true,
								'private': this.state.manga_list_private
							})
						}>
							<input type="checkbox" className="set-checkbox" id="manga_list_private" name="manga_list_private" checked={this.state.manga_list_private} onChange={this.toggleCheckbox.bind(null, 'manga_list_private')} />
							<label className="set-check-label" htmlFor="manga_list_private">
								{this.state.manga_list_private ? 'Private' : 'Public'}
							</label>
						</div>
					</div>
				</div>
				<div className="set-section">
					<div className="set-left">
						<div className="set-title">Protect stats</div>
						<div className="set-desc">Make your stats private.</div>
					</div>
					<div className="set-right">
						<div className={
							cx({
								'set-check': true,
								'private': this.state.stats_private
							})
						}>
							<input type="checkbox" className="set-checkbox" id="stats_private" name="stats_private" checked={this.state.stats_private} onChange={this.toggleCheckbox.bind(null, 'stats_private')} />
							<label className="set-check-label" htmlFor="stats_private">
								{this.state.stats_private ? 'Private' : 'Public'}
							</label>
						</div>
					</div>
				</div>
				<div className="set-section">
					<div className="set-left">
						<div className="set-title">Protect collections</div>
						<div className="set-desc">Make your collections private.</div>
					</div>
					<div className="set-right">
						<div className={
							cx({
								'set-check': true,
								'private': this.state.collections_private
							})
						}>
							<input type="checkbox" className="set-checkbox" id="collections_private" name="collections_private" checked={this.state.collections_private} onChange={this.toggleCheckbox.bind(null, 'collections_private')} />
							<label className="set-check-label" htmlFor="collections_private">
								{this.state.collections_private ? 'Private' : 'Public'}
							</label>
						</div>
					</div>
				</div>
				<div className="set-section">
					<div className="set-save-wrap">
						<div className="set-save" onClick={this.saveChanges}>
							Save changes
						</div>
					</div>
				</div>
			</form>
		)
	}
});

module.exports = Settings;