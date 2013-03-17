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

const LevelMatch = new RegExp('<level>([0-9]+)</level>');
const ClassMatch = new RegExp('<class>(.*)</class>');
const TimeMatch = new RegExp('<ttl>([0-9]+)</ttl>');
const IdleMatch = new RegExp('<totalidled>([0-9]+)</totalidled>');
const schema = "org.gnome.shell.extensions.IdleRPG";

let item, iRpg;
let metadata = Me.metadata;

function IdleRpgButton() {
    this._url = null;
    this._playerName = null;
    this._init();
};

IdleRpgButton.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);
        this._label = new St.Label({text: 'Level xx class'});
        this.actor.add_actor(this._label);

        let section = new PopupMenu.PopupMenuSection("IdleRPG");

        this._nextLevel = new PopupMenu.PopupMenuItem('Next level: ....');
        section.addMenuItem(this._nextLevel);

        this._idleTime = new PopupMenu.PopupMenuItem('Total idle time: ....');
        section.addMenuItem(this._idleTime);

        section.addMenuItem(this._idleTime);
        this.menu.addMenuItem(section);

        this.updateSettings();
    },

    create: function() {
        this._loadData(this._updatePanelButton.bind(this));
    },

    destroy: function() {
        //nothing yet
    },

    _updatePanelButton: function(playerData) {
        let level = LevelMatch.exec(playerData);
        let playerClass = ClassMatch.exec(playerData);
        this._label.text = 'Level ' + level[1] + ' ' + playerClass[1];

        let ttl = TimeMatch.exec(playerData);
        let idle = IdleMatch.exec(playerData);

        this.menu.box.get_children().forEach(function(c) {
            c.destroy()
        });

        let section = new PopupMenu.PopupMenuSection("IdleRPG");

        this._nextLevel = new PopupMenu.PopupMenuItem('Next level: ' + this._formatTime(ttl[1]));
        section.addMenuItem(this._nextLevel);

        this._idleTime = new PopupMenu.PopupMenuItem('Total idle time: ' + this._formatTime(idle[1]));
        section.addMenuItem(this._idleTime);

        section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

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
        section.addMenuItem(item);
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
        let url = 'http://' + this._url + '/xml.php?player=' + this._playerName;
        let message = Soup.Message.new('GET', url);
        _httpSession.queue_message(message, function(session, message) {
            cb(message.response_body.data)
        });
    },

    updateSettings: function() {
        let settings = new Lib.Settings(schema);
        this._settings = settings.getSettings();
        this._url = this._settings.get_string('server-url');
        this._playerName = this._settings.get_string('player-name');
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
