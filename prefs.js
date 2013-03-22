const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Extension.imports.lib;

const schema = "org.gnome.shell.extensions.IdleRPG";

function init()
{

}

function buildPrefsWidget()
{
    let prefs = new Prefs(schema);

    return prefs.buildPrefsWidget();
}

function Prefs(schema)
{
    this.init(schema);
}

Prefs.prototype = {
    settings: null,

    init: function(schema) {
	    let settings = new Lib.Settings(schema);
	    this.settings = settings.getSettings();
    },

    changeServerUrl: function(entry) {
	    this.settings.set_string("server-url", entry.text);
    },

    changePlayerName: function(entry) {
	    this.settings.set_string("player-name", entry.text);
    },

    changeUpdateTime: function(time) {
        this.settings.set_int('update-time', time.get_value());
    },

    buildPrefsWidget: function() {
        let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 10});

        let label = new Gtk.Label({ label: "<b>Global</b>", use_markup: true, xalign: 0});
        let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, margin_left: 20});

        //Change server url
        let hboxRemoveApplicationMenu = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let labelRemoveApplicationMenu = new Gtk.Label({label: "IdleRPG webserver Url", xalign: 0});
        let valueRemoveApplicationMenu = new Gtk.Entry({text: this.settings.get_string("server-url")});
        valueRemoveApplicationMenu.connect('notify::text', Lang.bind(this, this.changeServerUrl));

        hboxRemoveApplicationMenu.pack_start(labelRemoveApplicationMenu, true, true, 0);
        hboxRemoveApplicationMenu.add(valueRemoveApplicationMenu);
        vbox.add(hboxRemoveApplicationMenu);

        //Changeplayer name
        let hboxDisplayDesktopButton = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let labelDisplayDesktopButton = new Gtk.Label({label: "Player name", xalign: 0});
        let valueDisplayDesktopButton = new Gtk.Entry({text: this.settings.get_string("player-name")});
        valueDisplayDesktopButton.connect('notify::text', Lang.bind(this, this.changePlayerName));

        hboxDisplayDesktopButton.pack_start(labelDisplayDesktopButton, true, true, 0);
        hboxDisplayDesktopButton.add(valueDisplayDesktopButton);
        vbox.add(hboxDisplayDesktopButton);

        let sliderBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL});
        let sliderLabel = new Gtk.Label({ label: 'Hours before net update', xalign: 0 })
        let update_time = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 1, 24, 1);
        update_time.set_value(this.settings.get_int('update-time'));
        update_time.set_digits(0);
        update_time.set_hexpand(true);
        update_time.connect('value-changed', Lang.bind(this, this.changeUpdateTime));

        sliderBox.pack_start(sliderLabel, true, true, 0);
        sliderBox.add(update_time);
        vbox.add(sliderBox);

        frame.add(label);
        frame.add(vbox);
        frame.show_all();

        return frame;
    }
}
