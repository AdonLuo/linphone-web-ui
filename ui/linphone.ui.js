/*
 Linphone Web - Web plugin of Linphone an audio/video SIP phone
 Copyright (C) 2012  Yann Diorcet <yann.diorcet@linphone.org>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

/*globals linphone,jQuery,InstallTrigger,chrome */

linphone.ui = {
	core_number : 1,
	core_data : [],
	helpers : {},
	locales : [ {
		name : 'English(US)',
		locale : 'en_US',
		icon : 'style/images/flags/us.png'
	}, {
		name : 'Français',
		locale : 'fr_FR',
		icon : 'style/images/flags/fr.png'
	}, {
		name : 'Deutsche',
		locale : 'de_DE',
		icon : 'style/images/flags/de.png'
	}, {
		name : 'Italiano',
		locale : 'it_IT',
		icon : 'style/images/flags/it.png'
	} ],
	getCore : function(target) {
		var base = linphone.ui.getBase(target);
		return base.find('> .core').get()[0];
	},
	getBase : function(target) {
		if (typeof target === 'undefined') {
			target = jQuery(this);
		}
		if (target.is('.linphone')) {
			return target;
		} else {
			return target.parents('.linphone');
		}
	},
	_addEvent : null,
	addEvent : function(obj, name, func) {
		linphone.ui._addEvent(obj, name, func);
	},
	loadHandler : function(core) {
		if(typeof core === 'undefined' || typeof core.valid === 'undefined') {
			return;
		}
		
		linphone.core.log('Load Core');
		var base = linphone.ui.core_data[core.magic];

		base.find('.window .install').hide(); // Force hide

		linphone.ui.addEvent(core, 'globalStateChanged', linphone.ui.globalStateChanged);
		linphone.ui.addEvent(core, 'callStateChanged', linphone.ui.callStateChanged);
		linphone.ui.addEvent(core, 'registrationStateChanged', linphone.ui.registrationStateChanged);
		linphone.ui.addEvent(core, 'authInfoRequested', linphone.ui.authInfoRequested);
		linphone.ui.addEvent(core, 'displayStatus', linphone.ui.displayStatus);
		linphone.ui.addEvent(core, 'displayMessage', linphone.ui.displayMessage);
		linphone.ui.addEvent(core, 'displayWarning', linphone.ui.displayWarning);
		linphone.ui.addEvent(core, 'displayUrl', linphone.ui.displayUrl);
		var init_count = (typeof linphone.core.data().init_count !== "undefined") ? linphone.core.data().init_count : 0;
		var ret_value = core.init("local:///.linphonerc");
		if (ret_value !== 0) {
			linphone.ui.error(base, jQuery.i18n.get('errors.core.' + ret_value));
		} else {
			// Random port at first init
			if(init_count === 0) {
				core.sipPort = Math.floor((Math.random()*(65535 - 1024)) + 1024);
			}
			linphone.core.log('Sip port: ' + core.sipPort);
			
			// Init medias
			core.staticPicture = "internal:///share/images/nowebcamCIF.jpg";
			core.ring = "internal:///share/sounds/linphone/rings/oldphone.wav";
			core.ringback = "internal:///share/sounds/linphone/ringback.wav";
			core.playFile = "internal:///share/sounds/linphone/rings/toy-mono.wav";
				
			// Init volumes settings
			var rec_level = (typeof linphone.core.data().rec_level !== "undefined") ? linphone.core.data().rec_level : 100;
			base.find('.window .tools .mic-slider').slider('value', rec_level);
			core.recLevel = rec_level;

			var play_level = (typeof linphone.core.data().play_level !== "undefined") ? linphone.core.data().play_level : 100;
			base.find('.window .tools .hp-slider').slider('value', play_level);
			core.playLevel = play_level;

			var ring_level = (typeof linphone.core.data().ring_level !== "undefined") ? linphone.core.data().ring_level : 100;
			base.find('.window .tools .bell-slider').slider('value', ring_level);
			core.ringLevel = ring_level;

			base.find('.window .load').hide();

			core.usePreviewWindow = true;
			linphone.ui.video.updateSelfView(base);
			linphone.ui.video.updateVideoView(base);
			linphone.core.data().init_count = init_count + 1;
		}
	},
	globalStateChanged : function(core, state, message) {
		linphone.core.log(core + '| State: ' + state + ', ' + message);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('globalStateChanged', [state, message]);
		base.find('.window > .footer > .status').html(jQuery.i18n.get('globalstatetext.' + linphone.core.enums.getGlobalStateText(state)));
	},
	registrationStateChanged : function(core, proxy, state, message) {
		linphone.core.log(core + '| (' + proxy + '): ' + state + ', ' + message);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('registrationStateChanged', [proxy, state, message]);
	},
	callStateChanged : function(core, call, state, message) {
		linphone.core.log(core + '| (' + call + '): ' + state + ', ' + message);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('callStateChanged', [call, state, message]);
	},
	authInfoRequested : function(core, realm, username) {
		linphone.core.log(core + '| Auth: ' + realm + ', ' + username);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('authInfoRequested', [realm, username]);
	},
	displayStatus : function(core, message) {
		linphone.core.log(core + '| Status: ' + message);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('displayStatus', [message]);
	},
	displayMessage : function(core, message) {
		linphone.core.log(core + '| Message: ' + message);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('displayMessage', [message]);
	},
	displayWarning : function(core, message) {
		linphone.core.log(core + '| Warning: ' + message);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('displayWarning', [message]);
	},
	displayUrl : function(core, message, url) {
		linphone.core.log(core + '| Url: ' + message + ' - ' + url);
		var base = linphone.ui.core_data[core.magic];
		base.trigger('displayUrl', [message, url]);
	},
	error : function(base, msg) {
		base.find('.window .load').hide();
		base.find('.window .error .text').html(msg);
		base.find('.window .error').show();
	},
	outdated : function(actual, plugin) {
		var version1 = actual.split('.');
		var version2 = plugin.split('.');
		for(var i = 0; i < version1.length && i < version2.length; ++i) {
			if(i >= version1.length) {
				return false;
			}
			if(i >= version2.length) {
				return true;
			}
			var number1 = parseInt(version1[i], 10);
			var number2 = parseInt(version2[i], 10);
			if(number2 < number1) {
				return true;
			} else if(number2 > number1) {
				return false;
			}
		}
		return false;
	},
	detect : function(base) {
		linphone.core.log('Detection: ...');
		var core = base.find('.core').get()[0];
		if (typeof core !== 'undefined' && typeof core.valid !== 'undefined' && core.valid) {
			if(!linphone.ui.outdated(linphone.config.version, core.pluginVersion)) {
				linphone.core.log('Detection: Ok');
				base.find('.window .install').hide();
				return true;
			} else {
				linphone.core.log('Detection: Outdated');
				linphone.ui.unload(base);
				if (linphone.config.description_browser === 'Explorer') {
					jQuery('.linphone .window .install .text').html(jQuery.i18n.translate('base.install.text.outdated_auto'));
				} else if (linphone.config.description_browser === 'Firefox') {
					jQuery('.linphone .window .install .text').html(jQuery.i18n.translate('base.install.text.outdated_auto'));
				} else if (linphone.config.description_browser === 'Chrome') {
					jQuery('.linphone .window .install .text').html(jQuery.i18n.translate('base.install.text.outdated_auto'));
				} else {
					jQuery('.linphone .window .install .text').html(jQuery.i18n.translate('base.install.text.outdated_download'));
				}
			}
		} else if(typeof linphone.config.description !== 'undefined'){
			linphone.core.log('Detection: Not installed');
			if (jQuery.client.browser === "Firefox") {
				if (InstallTrigger.updateEnabled()) {
					InstallTrigger.install({
						"Linphone-Web":{
							URL: linphone.config.description.file,
							IconURL: linphone.config.description.icon
						}
					});
				}
			} else if (jQuery.client.browser === "Chrome") {
				chrome.webstore.install(linphone.config.description.file, function(){linphone.ui.unload(base);linphone.ui.load(base);}, function(){});
			}
		}
		return false;
	},
	unload : function(base) {
		linphone.core.log('Unload');
		base.find('.window .load').show();
		var core = base.find('> .core').get()[0];
		if (typeof core !== 'undefined') {
			delete linphone.ui.core_data[core.magic];
			base.get()[0].removeChild(core); // Use of dom: issue with jQuery
												// and embedded object
		}
	},
	load : function(base) {
		linphone.core.log('Loading ...');
		base.find('.window .install').show();
		base.find('.window .error').hide();
		navigator.plugins.refresh(false);
		var coreTemplate = base.find('.templates .Linphone-Core').render({
			magic : linphone.ui.core_number,
			codebase : linphone.config.codebase
		});
		var core = jQuery(coreTemplate);
		linphone.ui.core_data[linphone.ui.core_number] = base;
		linphone.ui.core_number = linphone.ui.core_number + 1;
		core.appendTo(base);

		linphone.ui.detect(base);
	},
	initPlugin: function() {
		// Find the correct plugin file
		if (typeof linphone.config.files[jQuery.client.os] !== 'undefined') {
			if(typeof linphone.config.files[jQuery.client.os][jQuery.client.arch] !== 'undefined') {
				if (typeof linphone.config.files[jQuery.client.os][jQuery.client.arch][jQuery.client.browser] !== 'undefined') {
					linphone.config.description = linphone.config.files[jQuery.client.os][jQuery.client.arch][jQuery.client.browser];
					linphone.config.description_browser = jQuery.client.browser;
				} else {
					linphone.config.description = linphone.config.files[jQuery.client.os][jQuery.client.arch].DEFAULT;
					linphone.config.description_browser = 'DEFAULT';
				}
			}
		}

		// Update
		linphone.config.codebase = "";
		if (typeof linphone.config.description !== 'undefined') {
			if (linphone.config.description_browser === 'Explorer') {
				jQuery('.linphone .window .install .text').addClass('{translate: \'base.install.text.auto\'}');
				linphone.config.codebase = linphone.config.description.file + '#Version=' + linphone.config.description.version;
			} else if (linphone.config.description_browser === 'Firefox') {
				jQuery('.linphone .window .install .text').addClass('{translate: \'base.install.text.auto\'}');
			} else if (linphone.config.description_browser === 'Chrome') {
				jQuery('.linphone .window .install .text').addClass('{translate: \'base.install.text.auto\'}');
			} else {
				jQuery('.linphone .window .install .text').addClass('{translate: \'base.install.text.download\'}');
				
				var content = '';
				content = '<button type="button" onclick="window.open(\'' + linphone.config.description;
				content += '\', \'_blank\')" class="{translate: \'base.install.download\'}">Download !</button>';
				jQuery('.linphone .window .install .buttons').html(content);
				jQuery.i18n.update(jQuery('.linphone .window .install .buttons'), true);
				jQuery('.linphone .window .install button').button();
			} 
		} else {
			jQuery('.linphone .window .install .text').hide();
			jQuery('.linphone .window .install .refresh').hide();
			jQuery('.linphone .window .install .unavailable').show();
		}
	},
	init : function() {
		linphone.core.log('Init LinphoneJS');
		var base = jQuery('.linphone');
		linphone.ui.locale.load();
		linphone.ui.menu.populateLocalesMenu(base);
	}
};

if (!jQuery.browser.msie) {
	linphone.ui._addEvent = function(obj, name, func) {
		obj.addEventListener(name, func, false);
	};
} else {
	linphone.ui._addEvent = function(obj, name, func) {
		obj.attachEvent("on" + name, func);
	};
}

// OnLoad
jQuery(function() {
	jQuery.fn.disableSelection = function() {
		return this.each(function() {
			jQuery(this).attr('unselectable', 'on').css({
				'-moz-user-select' : 'none',
				'-webkit-user-select' : 'none',
				'user-select' : 'none',
				'-ms-user-select' : 'none'
			}).each(function() {
				this.onselectstart = function() {
					return false;
				};
			});
		});
	};

	// Tabs
	jQuery('.linphone .window > .content .tabs').tabs({
		closable : true,
		scrollable : true
	});

	// Apply JQuery UI button style
	jQuery(".linphone .window button").button();

	// Disable selection on tools
	jQuery('.linphone .window .tools').disableSelection();

	// Disable selection on dialogs titlebar
	jQuery('.linphone .window .dialogs .ui-dialog-titlebar').disableSelection();
	
	// Disable selection on options titlebar
	jQuery('.linphone .window .options .ui-dialog-titlebar').disableSelection();

	jQuery('.linphone .window .options .ui-dialog-titlebar-close').click(function(event) {
		jQuery(this).parents('.options').fadeOut('fast');
	});

	jQuery('.linphone .window .options .ui-dialog-titlebar-close').hover(function() {
		jQuery(this).addClass("ui-state-hover");
	}, function() {
		jQuery(this).removeClass("ui-state-hover");
	});

	// Add template helper
	jQuery.views.registerHelpers({
		linphone_ui_helpers_getLinphoneRegistrationStateText : function(val) {
			return linphone.core.enums.getRegistrationStateText(val);
		}
	});
	// Add template helper
	jQuery.views.registerHelpers({
		linphone_ui_helpers_payloadTypeEnabled : function(val) {
			return this.core.payloadTypeEnabled(val);
		}
	});
});

// Click
jQuery('html').click(function(event) {
	var target = jQuery(event.target);
	var base = linphone.ui.getBase(target);
});
