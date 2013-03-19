const St = imports.gi.St;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const _httpSession = new Soup.SessionAsync();
const Lib = Extension.imports.lib;
const Shell = imports.gi.Shell;
const Me = imports.misc.extensionUtils.getCurrentExtension();

Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

const Matches = {
    level: new RegExp('<level>([0-9]+)</level>'),
    playerClass: new RegExp('<class>(.*)</class>'),
    playTime: new RegExp('<ttl>([0-9]+)</ttl>'),
    idle: new RegExp('<totalidled>([0-9]+)</totalidled>'),
    online: new RegExp('<online>([0-9]+)</online>'),
    items: new RegExp('<total>([0-9]+)</total>(\\s+)</items>'),
    penalties: new RegExp('<total>([0-9]+)</total>(\\s+)</penalties>')
}


const schema = "org.gnome.shell.extensions.IdleRPG";

let item, iRpg;
let metadata = Me.metadata;

function IdleRpgButton() {
    this._settings = null;
    this._stats = {
        level: null,
        playerClass: null,
        playTime: null,
        idle: null,
        online: null,
        items: null,
        penalties: null
    };
    this._init();
};

IdleRpgButton.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);

        let settings = new Lib.Settings(schema);
        this._settings = settings.getSettings();

        this._label = new St.Label({text: 'Level xx class'});
        this.actor.add_actor(this._label);

        let section = new PopupMenu.PopupMenuSection("IdleRPG");

        this._nextLevel = new PopupMenu.PopupMenuItem('Next level: ....');
        section.addMenuItem(this._nextLevel);

        this._idleTime = new PopupMenu.PopupMenuItem('Total idle time: ....');
        section.addMenuItem(this._idleTime);

        section.addMenuItem(this._idleTime);
        this.menu.addMenuItem(section);
    },

    create: function() {
        this._loadData(this._updatePanelButton.bind(this));
    },

    destroy: function() {
        //nothing yet
    },

    _updatePanelButton: function(playerData) {
        let level = Matches.level.exec(playerData);
        let playerClass = Matches.playerClass.exec(playerData);
        let items = Matches.items.exec(playerData);
        let penalty = Matches.penalties.exec(playerData);
        let online = Matches.online.exec(playerData);
        online = (online[1] === '1') ? 'Yes' : 'No';

        this._label.set_text('Level ' + level[1] + ' ' + playerClass[1]);

        let ttl = Matches.playTime.exec(playerData);
        let idle = Matches.idle.exec(playerData);

        this.menu.box.get_children().forEach(function(c) {
            c.destroy()
        });
        let section = new PopupMenu.PopupMenuSection("IdleRPG");

        this._level = new PopupMenu.PopupMenuItem('Level: ' + level[1]);
        section.addMenuItem(this._level);

        this._playerClass = new PopupMenu.PopupMenuItem('Class: ' + playerClass[1]);
        section.addMenuItem(this._playerClass);

        this._items = new PopupMenu.PopupMenuItem('Item sum: ' + items[1]);
        section.addMenuItem(this._items);

        this._penalties = new PopupMenu.PopupMenuItem('Penalty sum: ' + this._formatTime(penalty[1]));
        section.addMenuItem(this._penalties);

        this._online = new PopupMenu.PopupMenuItem('Online: ' + online);
        section.addMenuItem(this._online);

        section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._nextLevel = new PopupMenu.PopupMenuItem('Next level: ' + this._formatTime(ttl[1]));
        section.addMenuItem(this._nextLevel);

        this._idleTime = new PopupMenu.PopupMenuItem('Total idle time: ' + this._formatTime(idle[1]));
        section.addMenuItem(this._idleTime);

        this._createPreferencesAndUpdateButton(section);

        this.menu.addMenuItem(section);
    },

    _formatTime: function(ttl) {
        let days = (ttl >= 86400) ? Math.floor(ttl / 86400) : 0;
        ttl = ttl - (days * 86400);
        let hours = Math.floor(ttl / 3600);
        hours = (hours > 9) ? hours : '0' + hours;
        ttl = ttl - (hours * 3600);
        let minutes = Math.floor(ttl / 60);
        minutes = (minutes > 9) ? minutes : '0' + minutes;
        let seconds = ttl % 60;
        seconds = (seconds > 9) ? seconds : '0' + seconds;

        return days + ' days ' + hours + ':' + minutes + ':' + seconds;
    },

    _loadData: function(cb) {
        let url = 'http://' + this._settings.get_string('server-url') + '/xml.php?player=' + this._settings.get_string('player-name');
        let message = Soup.Message.new('GET', url);
        _httpSession.queue_message(message, function(session, message) {
            cb(message.response_body.data)
        });
    },

    _fetchPlayerStats: function(playerStats) {

    },

    _createPlayerDataMenu: function(menuSection, playerData) {

    },

    _createPreferencesAndUpdateButton: function (menuSection) {
        menuSection.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let _appSys = Shell.AppSystem.get_default();
        let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');
        item = new PopupMenu.PopupMenuItem(_("Preferences..."));
        item.connect('activate', function () {
            if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING){
                _gsmPrefs.activate();
            } else {
                _gsmPrefs.launch(global.display.get_current_time_roundtrip(),
                    [metadata.uuid],-1,null);
            }
        });
        menuSection.addMenuItem(item);

        item = new PopupMenu.PopupMenuItem(_("Update now!"));
        let self = this;
        item.connect('activate', function () {
            self._loadData(self._updatePanelButton.bind(self));
        });
        menuSection.addMenuItem(item);
    }
}

function init() {
    iRpg = new IdleRpgButton();
}

function enable() {
    iRpg.create();
    Main.panel.addToStatusArea('IdleRPG', iRpg);
}

function disable() {
    iRpg.destroy();
}
