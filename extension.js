const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const _httpSession = new Soup.SessionAsync();
const Lib = Me.imports.lib;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;

Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

const schema = "org.gnome.shell.extensions.IdleRPG";

let iRpg, event, settings;
let metadata = Me.metadata;

function IdleRpgButton() {
    this._settings = null;
    this._stats = {
        level: null,
        playerClass: null,
        items: null,
        online: null,
        playTime: null,
        idle: null,
        penalties: null
    };
    this._texts = {
        level: _("Level: "),
        playerClass: _("Class: "),
        online: _("Online: "),
        items: _("Item sum: "),
        playTime:  _("Next level: "),
        idle: _("Total idle time: "),
        penalties: _("Penalty sum: ")
    };
    this._matches = {
        level: new RegExp('<level>([0-9]+)</level>'),
        playerClass: new RegExp('<class>(.*)</class>'),
        playTime: new RegExp('<ttl>([0-9]+)</ttl>'),
        idle: new RegExp('<totalidled>([0-9]+)</totalidled>'),
        online: new RegExp('<online>([0-9]+)</online>'),
        items: new RegExp('<total>([0-9]+)</total>(\\s+)</items>'),
        penalties: new RegExp('<total>([0-9]+)</total>(\\s+)</penalties>')
    };
    this._init();
};

IdleRpgButton.prototype = {
    __proto__: PanelMenu.Button.prototype,

    _init: function() {
        PanelMenu.Button.prototype._init.call(this, 0.0);

        this._settings = settings.getSettings();

        this._label = new St.Label({text: 'No Player', style_class: 'offline'});
        this.actor.add_actor(this._label);

        let section = new PopupMenu.PopupMenuSection("IdleRPG");

        for (let stat in this._stats) {
            let menuItem;
            if(this._texts.hasOwnProperty(stat)) {
                menuItem = new PopupMenu.PopupMenuItem(this._texts[stat] + '...');
            } else {
                menuItem = new PopupMenu.PopupMenuItem(stat + ': ...');
            }
            section.addMenuItem(menuItem);
        }

        this._createPreferencesAndUpdateButton(section);

        this.menu.addMenuItem(section);
    },

    create: function() {
        this._loadData(Lang.bind(this, this._updatePanelButtonWithUser), Lang.bind(this, this._updatePanelButtonWithError));
        let time = this._settings.get_int('update-time') * 3600;
        event = GLib.timeout_add_seconds(0, time, Lang.bind(this, function () {
            this._loadData(Lang.bind(this, this._updatePanelButtonWithUser), Lang.bind(this, this._updatePanelButtonWithError));
            return true;
        }));
    },

    _updatePanelButtonWithUser: function(playerData) {
        for (let match in this._matches) {
            if(this._stats.hasOwnProperty(match)) {
                let tmpMatch = this._matches[match].exec(playerData);
                this._stats[match] = tmpMatch[1] || null;
            }
        }
        let css_class = (this._stats.online === '1') ? 'online' : 'offline';
        this._stats.online = (this._stats.online === '1') ? 'Yes' : 'No';
        this._label.set_text('Level ' + this._stats.level + ' ' + this._stats.playerClass);
        this._label.style_class = css_class;

        this._destroyMenu();

        let section = new PopupMenu.PopupMenuSection("IdleRPG");

        for (let stat in this._stats) {
            let menuItem;
            let tmpStat = (['penalties', 'playTime', 'idle'].indexOf(stat) !== -1) ?
                this._formatTime(this._stats[stat]) : this._stats[stat];

            if(this._texts.hasOwnProperty(stat)) {
                menuItem = new PopupMenu.PopupMenuItem(this._texts[stat] + tmpStat);
            } else {
                menuItem = new PopupMenu.PopupMenuItem(stat + ': ' + tmpStat);
            }
            section.addMenuItem(menuItem);
        }

        this._createPreferencesAndUpdateButton(section);

        this.menu.addMenuItem(section);
    },

    _destroyMenu: function() {
        this.menu.box.get_children().forEach(function(c) {
            c.destroy()
        });

    },

    _updatePanelButtonWithError: function() {
        let css_class = 'offline';
        this._label.set_text('No connection');
        this._label.style_class = css_class;

        this._destroyMenu();

        let section = new PopupMenu.PopupMenuSection("IdleRPG");
        this._createPreferencesAndUpdateButton(section);
        this.menu.addMenuItem(section);
    },

    _formatTime: function(time) {
        let days = (time >= 86400) ? Math.floor(time / 86400) : 0;
        time = time - (days * 86400);
        let hours = Math.floor(time / 3600);
        hours = (hours > 9) ? hours : '0' + hours;
        time = time - (hours * 3600);
        let minutes = Math.floor(time / 60);
        minutes = (minutes > 9) ? minutes : '0' + minutes;
        let seconds = time % 60;
        seconds = (seconds > 9) ? seconds : '0' + seconds;

        return days + ' days ' + hours + ':' + minutes + ':' + seconds;
    },

    _loadData: function(cbSuccess, cbError) {
        let url = 'http://' + this._settings.get_string('server-url') + '/xml.php?player=' + this._settings.get_string('player-name');
        let message = Soup.Message.new('GET', url);
        _httpSession.queue_message(message, function(session, message) {
            if (message.status_code === 200 && message.response_headers.get_content_type() == 'text/xml,') {
                cbSuccess(message.response_body.data)
            } else {
                if(typeof cbError === 'function') {
                    cbError();
                }
            }
        });
    },

    _createPreferencesAndUpdateButton: function (menuSection) {
        menuSection.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let _appSys = Shell.AppSystem.get_default();
        let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');
        let item = new PopupMenu.PopupMenuItem(_("Preferences..."));
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
            self._loadData(Lang.bind(self, self._updatePanelButtonWithUser));
        });
        menuSection.addMenuItem(item);
    }
}

function init() {
    settings = new Lib.Settings(schema);
}

function enable() {
    iRpg = new IdleRpgButton();
    iRpg.create();
    Main.panel.addToStatusArea('IdleRPG', iRpg);
}

function disable() {
    Mainloop.source_remove(event);
    iRpg.destroy();
}
