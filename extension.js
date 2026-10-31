import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

class AnimatedStateBox extends St.BoxLayout {
    constructor(frameNames, framesDir, labelText) {
        super({
            orientation: Clutter.Orientation.VERTICAL,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
            y_expand: true,
            style: 'spacing: 10px; padding: 8px 6px 6px 6px;',
        });

        this._timeoutId = 0;
        this._frameIndex = 0;

        this._frames = frameNames.map(name => {
            const path = GLib.build_filenamev([framesDir, name]);
            return new Gio.FileIcon({file: Gio.File.new_for_path(path)});
        });

        this._image = new St.Icon({
            gicon: this._frames[0],
            icon_size: 190,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._image);

        this._label = new St.Label({
            text: labelText,
            x_align: Clutter.ActorAlign.CENTER,
            style: 'font-size: 17px; font-weight: 700; text-align: center;',
        });
        this._label.clutter_text.set_line_wrap(true);
        this._label.clutter_text.set_line_wrap_mode(Pango.WrapMode.WORD_CHAR);
        this._label.clutter_text.set_ellipsize(Pango.EllipsizeMode.NONE);
        this._label.clutter_text.set_justify(true);
        this.add_child(this._label);

        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 110, () => {
            if (!this._image)
                return GLib.SOURCE_REMOVE;
            this._frameIndex = (this._frameIndex + 1) % this._frames.length;
            this._image.gicon = this._frames[this._frameIndex];
            return GLib.SOURCE_CONTINUE;
        });
    }

    stop() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = 0;
        }
    }
}

export default class YahyaEmptyNotificationExtension extends Extension {
    enable() {
        this._messageList = Main.panel?.statusArea?.dateMenu?._messageList;
        const placeholder = this._messageList?._placeholder;
        if (!placeholder)
            throw new Error('GNOME notification placeholder was not found');

        this._placeholder = placeholder;
        this._originalChildren = placeholder.get_children().slice();
        for (const child of this._originalChildren)
            placeholder.remove_child(child);

        const emptyFramesDir = GLib.build_filenamev([this.path, 'frames-empty']);
        const activeFramesDir = GLib.build_filenamev([this.path, 'frames-active']);

        this._emptyBox = new AnimatedStateBox([
            'frame-00.png',
            'frame-01.png',
            'frame-02.png',
            'frame-03.png',
            'frame-04.png',
            'frame-05.png',
            'frame-06.png',
            'frame-07.png',
            'frame-08.png',
            'frame-09.png',
            'frame-10.png',
            'frame-11.png',
            'frame-12.png',
            'frame-13.png',
            'frame-14.png',
            'frame-15.png',
            'frame-16.png',
            'frame-17.png',
            'frame-18.png',
            'frame-19.png',
            'frame-20.png',
            'frame-21.png',
            'frame-22.png',
            'frame-23.png',        ], emptyFramesDir, 'Masih sepi…\nbelum ada satu pun notifikasi 😢');

        this._activeBox = new AnimatedStateBox([
            'frame-0.png',
            'frame-1.png',
            'frame-2.png',
            'frame-3.png',
            'frame-4.png',
            'frame-5.png',
            'frame-6.png',
            'frame-7.png',        ], activeFramesDir, 'Ting tong!\nAda pesan buat kamu 🔔');

        placeholder.add_child(this._emptyBox);

        this._leftContainer = placeholder.get_parent();
        if (!this._leftContainer)
            throw new Error('GNOME notification container was not found');
        this._leftContainer.add_child(this._activeBox);

        this._activeBox.hide();
        this._syncState();
        this._pollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 400, () => {
            this._syncState();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _hasNotifications() {
        const section = this._messageList?._notificationSection;
        if (!section)
            return false;

        if (Array.isArray(section._messages))
            return section._messages.length > 0;

        if (section._messages && typeof section._messages.size === 'number')
            return section._messages.size > 0;

        if (section._list && typeof section._list.get_children === 'function')
            return section._list.get_children().length > 0;

        if (typeof section.get_children === 'function')
            return section.get_children().length > 0;

        return false;
    }

    _syncState() {
        const hasNotifications = this._hasNotifications();
        if (hasNotifications) {
            this._emptyBox.hide();
            this._activeBox.show();
        } else {
            this._activeBox.hide();
            this._emptyBox.show();
        }
    }

    disable() {
        if (this._pollId) {
            GLib.Source.remove(this._pollId);
            this._pollId = 0;
        }

        this._emptyBox?.stop();
        this._activeBox?.stop();

        if (this._emptyBox?.get_parent())
            this._emptyBox.get_parent().remove_child(this._emptyBox);
        if (this._activeBox?.get_parent())
            this._activeBox.get_parent().remove_child(this._activeBox);

        if (this._placeholder) {
            for (const child of this._originalChildren ?? [])
                this._placeholder.add_child(child);
        }

        this._emptyBox?.destroy();
        this._activeBox?.destroy();
        this._emptyBox = null;
        this._activeBox = null;
        this._placeholder = null;
        this._leftContainer = null;
        this._messageList = null;
        this._originalChildren = [];
    }
}
