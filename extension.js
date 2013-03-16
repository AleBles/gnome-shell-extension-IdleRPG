const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Soup = imports.gi.Soup;

const _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

const LevelMatch = new RegExp('<level>([0-9]+)</level>');
const ClassMatch = new RegExp('<class>(.*)</class>');

let text, button;
let server = 'http://xethron.lolhosting.net/';
let player = 'Str1ngS';

let IdleRpgButton = function() {
    this._panelButton = null;
    this._panelButtonText = null;
    this._init();
};

iRpg = IdleRpgButton.prototype;
iRpg._init = function() {
    this._panelButton = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    this._panelButtonText = new St.Label({
        text: 'Level xx class'
    });

    this._panelButton.set_child(this._panelButtonText);
    this._panelButton.connect('button-press-event', this.showStatWindow.bind(this));
};
iRpg.create = function () {
    this._loadData(this._updatePanelButton.bind(this));
    Main.panel._rightBox.insert_child_at_index(this._panelButton, 0);
};
iRpg.destroy = function () {
    Main.panel._rightBox.remove_child(this._panelButton);
};
iRpg._updatePanelButton = function (playerData) {
    let level = LevelMatch.exec(playerData);
    let playerClass = ClassMatch.exec(playerData);
    global.log('Level ' + level[1] + ' ' + playerClass[1]);
    global.log(JSON.stringify(this._panelButtonText));
    this._panelButtonText.text = 'Level ' + level[1] + ' ' + playerClass[1];
    global.log(JSON.stringify(this._panelButtonText));
};
iRpg._loadData = function (cb) {
    let url = server + 'xml.php?player=' + player;
    let message = Soup.Message.new('GET', url);
    _httpSession.queue_message(message, function(session, message) {
        cb(message.response_body.data)
    });
};
iRpg.showStatWindow = function () {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;
    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: this.hideStatWindow.bind(this) });
};
iRpg.hideStatWindow = function() {
    Main.uiGroup.remove_actor(text);
    text = null;
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
