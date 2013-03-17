const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const _httpSession = new Soup.SessionAsync();
const Lib = Extension.imports.lib;
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

const LevelMatch = new RegExp('<level>([0-9]+)</level>');
const ClassMatch = new RegExp('<class>(.*)</class>');
const schema = "org.gnome.shell.extensions.IdleRPG";

let text, button;

let IdleRpgButton = function() {
    this._url = null;
    this._playerName = null;
    this._init();
};

iRpg = IdleRpgButton.prototype;
iRpg.__proto__ = PanelMenu.Button.prototype;
iRpg._init = function() {
    PanelMenu.Button.prototype._init.call(this, 0.0);
    this._label = new St.Label({text: 'Level xx class'});
    this.actor.add_actor(this._label);

    this._nextLevel = new St.Label({ text: 'Next level in....'});
    this.menu.addActor(this._nextLevel);
};
iRpg.create = function () {
    this._loadData(this._updatePanelButton.bind(this));
    Main.panel._rightBox.insert_child_at_index(this.actor, 0);
};
iRpg.destroy = function () {
    Main.panel._rightBox.remove_child(this.actor);
};
iRpg._updatePanelButton = function (playerData) {
    let level = LevelMatch.exec(playerData);
    let playerClass = ClassMatch.exec(playerData);
    this._label.text = 'Level ' + level[1] + ' ' + playerClass[1];
};
iRpg._loadData = function (cb) {
    let url = 'http://' + this._url + '/xml.php?player=' + this._playerName;
    let message = Soup.Message.new('GET', url);
    _httpSession.queue_message(message, function(session, message) {
        cb(message.response_body.data)
    });
};
iRpg.updateSettings = function () {
    let settings = new Lib.Settings(schema);
    this._settings = settings.getSettings();
    this._url = this._settings.get_string('server-url');
    this._playerName = this._settings.get_string('player-name');
};

function init() {
    button = new IdleRpgButton();
}

function enable() {
    button.create();
}

function disable() {
    button.destroy();
}
