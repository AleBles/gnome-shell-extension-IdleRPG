#About

gnome-shell-extension-IdleRPG is a simple gnome 3 extensions that allows you to see the stats of your IdleRPG character in your panel.

**The server does need a website counterpart in order to load the statistics.**

----

# Installation

After the installation, restart GNOME Shell (`Alt`+`F2`, `r`, `Enter`) and enable the extension through *gnome-tweak-tool*.

## Manual

This is the **recommended method** for installation as you always get the latest version.
You can install this extension for your user by executing:

    cd ~/.local/share/gnome-shell/extensions
    git clone https://github.com/AleBles/gnome-shell-extension-IdleRPG.git IdleRPG@alebles.keesinggames.nl
    glib-compile-schemas IdleRPG@alebles.keesinggames.nl/schemas/

or system wide by executing (this requires root permissions):

    cd /usr/share/gnome-shell/extensions/
    git clone https://github.com/AleBles/gnome-shell-extension-IdleRPG.git IdleRPG@alebles.keesinggames.nl
    glib-compile-schemas IdleRPG@alebles.keesinggames.nl/schemas/

After installation you need to restart the GNOME shell:

* `ALT`+`F2` to open the command prompt
* Enter `r` to restart the GNOME shell

Then enable the extension:
Open `gnome-tweak-tool` -> `Shell Extensions` -> `IdleRPG` -> On
## Through extensions.gnome.org

[IdleRPG](https://extensions.gnome.org/extension/643/idlerpg/)

----

# Configuration

Launch *gnome-shell-extension-prefs* and select *IdleRPG* from the drop-down menu to edit the configuration.

You can also use *dconf-editor* or *gsettings* to configure the extension through the command line.

----

# Licence

Copyright (C) 2013

* Ale Bles <alehbles@hotmail.com>,

This file is part of *gnome-shell-extension-IdleRPG*.

*gnome-shell-extension-IdleRPG* is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License as published by the Free Software Foundation, either version 3** of the License, or (at your option) any later version.

*gnome-shell-extension-IdleRPG* is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with *gnome-shell-extension-IdleRPG*.  If not, see <http://www.gnu.org/licenses/>.
