/*jslint browser: true, nomen: true */
/*global Ember, $, sjcl, yithServerHost, yithClientId */

// Yith Library web client
// Copyright (C) 2012  Yaco Sistemas S.L.
// Copyright (C) 2012  Alejandro Blanco
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

var Yith = Ember.Application.create();

// *****
// VIEWS
// *****

Yith.ListPasswordsView = Ember.View.extend({
    templateName: "password-list",
    initialized: false,
    passwordList: [],
    activeFilters: [],

    activeFiltersLength: Ember.computed(function () {
        "use strict";
        return this.activeFilters.length;
    }).property("activeFilters"),

    processedPasswordList: Ember.computed(function () {
        "use strict";
        var filters = this.activeFilters,
            result;

        result = this.passwordList.sort(function (pass1, pass2) {
            var a = pass1.get("service").toLowerCase(),
                b = pass2.get("service").toLowerCase(),
                result = 0;

            if (a > b) {
                result = 1;
            } else if (a < b) {
                result = -1;
            }

            return result;
        });

        if (filters.length > 0) {
            result = result.filter(function (password, index) {
                var tags = password.get("tags");
                return filters.every(function (f, index) {
                    return tags.some(function (t, index) {
                        return f === t;
                    });
                });
            });
        }

        return result;
    }).property("passwordList", "activeFilters"),

    passwordListClass: Ember.computed(function () {
        "use strict";
        if (this.passwordList.length > 0) {
            return "span12";
        }
        return "hide";
    }).property("passwordList"),

    allTags: Ember.computed(function () {
        "use strict";
        var allTags = new Ember.Set();
        this.passwordList.forEach(function (item) {
            allTags.addEach(item.get("tags"));
        });
        allTags = allTags.toArray().sort(function (a, b) {
            return a.localeCompare(b);
        });
        return allTags;
    }).property("passwordList"),

    noPasswordsClass: Ember.computed(function () {
        "use strict";
        if (this.initialized && this.passwordList.length === 0) {
            return "span6 offset3";
        }
        return "hide";
    }).property("initialized", "passwordList"),

    getPassword: function (evt) {
        "use strict";
        Yith.askMasterPassword(function (masterPassword) {
            var secret = evt.context.get("secret"),
                node = $(evt.target),
                countdown = node.next().next(),
                close = countdown.next(),
                timer;
            try {
                secret = Yith.decipher(masterPassword, secret);
            } catch (err) {
                return false;
            }
            masterPassword = null;
            node.next().val(secret).show().focus().select();
            secret = null;

            if (Yith.settings.get("disableCountdown")) {
                close.off("click");
                close.click(function (evt) {
                    node.next().hide().attr("value", "");
                    close.hide();
                });
                close.show();
            } else {
                countdown.text("5");
                countdown.show();
                timer = setInterval(function () {
                    countdown.text(parseInt(countdown.text(), 10) - 1);
                }, 1000);
                setTimeout(function () {
                    clearInterval(timer);
                    node.next().hide().attr("value", "");
                    countdown.hide();
                }, 5500);
            }
            return true;
        });
    },

    filterByTag: function (evt) {
        "use strict";
        var filters = new Ember.Set(this.activeFilters);
        filters.push($(evt.target).text());
        this.set("activeFilters", filters.toArray());
    },

    removeFilter: function (evt) {
        "use strict";
        var filters = new Ember.Set(this.activeFilters),
            target = evt.target;
        if (target.tagName === "I") {
            target = target.parentNode;
        }
        filters.remove($(target).text().trim());
        this.set("activeFilters", filters.toArray());
    },

    notes: function (evt) {
        "use strict";
        var node = $(evt.target),
            _id,
            passwordList,
            password,
            content;

        if (node.data().popover === undefined) {
            _id = node.parent().parent().attr("id");
            passwordList = Yith.listPasswdView.get("passwordList");
            password = passwordList.filter(function (item) {
                return item.get("_id") === _id;
            })[0];
            content = password.get("notes");

            if (content !== "" && content !== null) {
                node.popover({
                    placement: "left",
                    content: content,
                    title: password.get("service"),
                    trigger: "hover"
                });
                node.popover("show");
            }
        }
    },

    edit: function (evt) {
        "use strict";
        var password = evt.context;
        Yith.initEditModal();
        password.set("provisionalTags", password.get("tags"));
        Yith.editView.set("password", password);
        Yith.editView.set("isnew", false);
        Yith.editView.set("isExpirationDisabled", password.get("expiration") <= 0);
        Yith.editModal.modal("show");
    }
});

Yith.EditPasswordView = Ember.View.extend({
    templateName: "password-edit",
    password: null,
    isnew: false,
    checkerList: [],
    isExpirationDisabled: false,

    isExpirationEnabled: Ember.computed(function () {
        "use strict";
        return !this.get("isExpirationDisabled");
    }).property("isExpirationDisabled"),

    secretGroupClass: Ember.computed(function () {
        "use strict";
        var cssClass = "control-group";
        if (!this.isnew) {
            cssClass += " hide";
        }
        return cssClass;
    }).property("isnew"),

    showSecretGroup: function () {
        "use strict";
        $("#secret-group").removeClass("hide");
        $("#modify-secret-group").addClass("hide");
    },

    validateSecretChecker: function () {
        "use strict";
        var equal = $("#edit-secret1").val() === $("#edit-secret2").val();

        if ($("#edit-secret1").val() !== "") {
            $("#edit-secret1").parent().parent().removeClass("error");
            $("#edit-secret1").parent().parent().find(".help-block.req").hide();
        }

        if (equal) {
            $("#edit-secret1").parent().parent().removeClass("error");
            $("#edit-secret1").parent().parent().find(".help-block.match").hide();
        } else {
            $("#edit-secret1").parent().parent().addClass("error");
            $("#edit-secret1").parent().parent().find(".help-block.match").show();
        }

        return equal;
    },

    validateSecret: function (evt) {
        "use strict";
        var context = this;
        while (this.checkerList.length > 0) {
            clearTimeout(this.checkerList.pop());
        }
        this.checkerList.push(setTimeout(function () {
            context.validateSecretChecker();
        }, 500));
    },

    enableExpiration: function (evt) {
        "use strict";
        var enable = evt.target.checked;
        Yith.editView.set("isExpirationDisabled", !enable);
    },

    addTag: function (evt) {
        "use strict";
        evt.stopPropagation();
        evt.preventDefault();

        var tags = $("#edit-tags").val().split(','),
            password = evt.context.get("password"),
            provisionalTags = Yith.cloneList(password.get("provisionalTags"));

        tags.forEach(function (tag) {
            tag = tag.trim();
            if (tag !== "" && provisionalTags.indexOf(tag) < 0) {
                provisionalTags.push(tag);
            }
        });
        password.set("provisionalTags", provisionalTags);
        $("#edit-tags").val("");
    },

    removeTag: function (evt) {
        "use strict";
        var password = evt.view.get("password"),
            provisionalTags = password.get("provisionalTags");

        provisionalTags = provisionalTags.filter(function (item, idx, self) {
            return item !== evt.context;
        });
        password.set("provisionalTags", provisionalTags);
    },

    saveChanges: function (evt) {
        "use strict";
        var password = evt.view.get("password"),
            savePassword = ($("#edit-secret1").val() !== "");

        try {
            this.validateForm();
        } catch (err) {
            return;
        }

        Yith.saveChangesInPassword(password, savePassword, function () {
            Yith.ajax.updatePassword(password);
            Yith.editModal.modal("hide");
        });
    },

    createPassword: function (evt) {
        "use strict";
        var password = evt.view.get("password"),
            passwordList = Yith.cloneList(Yith.listPasswdView.get("passwordList"));

        try {
            this.validateForm();
        } catch (err) {
            return;
        }

        Yith.saveChangesInPassword(password, true, function () {
            passwordList.push(password);
            Yith.listPasswdView.set("passwordList", passwordList);
            Yith.ajax.createPassword(password);
            Yith.editModal.modal("hide");
        });
    },

    deletePassword: function (evt) {
        "use strict";
        var password = evt.view.get("password");

        Yith.listPasswdView.set("passwordList", Yith.listPasswdView.get("passwordList").filter(
            function (item, idx, self) {
                return item.get("_id") !== password.get("_id");
            }
        ));
        password.destroy();
        Yith.ajax.deletePassword(password);
        Yith.editModal.modal("hide");
    },

    checkEmptiness: function (evt) {
        "use strict";
        if ($("#edit-service").val() !== "") {
            $("#edit-service").parent().removeClass("error");
            $("#edit-service").next().hide();
        }
    },

    validateForm: function () {
        "use strict";
        var valid = true,
            aux;

        if (this.isnew) {
            valid = valid && this.validateSecretChecker();
            aux = $("#edit-secret1").val() !== "";
            if (!aux) {
                $("#edit-secret1").parent().parent().addClass("error");
                $("#edit-secret1").parent().parent().find(".help-block.req").show();
            }
            valid = valid && aux;
        }

        aux = $("#edit-service").val() !== "";
        if (!aux) {
            $("#edit-service").parent().addClass("error");
            $("#edit-service").next().show();
        }
        valid = valid && aux;

        if (!valid) {
            throw "Not valid";
        }
    },

    generatePassword: function (evt) {
        "use strict";
        evt.preventDefault();
        evt.stopPropagation();

        var password = "",
            charset = Yith.settings.get("passGenCharset"),
            length = Yith.settings.get("passGenLength"),
            aux,
            i;

        for (i = 0; i < length; i += 1) {
            aux = Math.floor(Math.random() * charset.length);
            password += charset.charAt(aux);
        }

        $("#edit-secret2").val(password);
        $("#edit-secret1").val(password).trigger("keyup");
        password = null;
    }
});

Yith.SettingsView = Ember.View.extend({
    templateName: "settings",
    advanced: false,

    advancedClass: Ember.computed(function () {
        "use strict";
        var cssClass = "row advanced";
        if (!this.advanced) {
            cssClass += " hide";
        }
        return cssClass;
    }).property("advanced"),

    showAdvanced: function (evt) {
        "use strict";
        var target = $(evt.target);
        target.toggleClass("active");
        this.set("advanced", target.hasClass("active"));
    },

    disableCountdown: function (evt) {
        "use strict";
        var target = $(evt.target);
        target.toggleClass("active");
        Yith.settings.set("disableCountdown", target.hasClass("active"));
    },

    rememberMaster: function (evt) {
        "use strict";
        var target = $(evt.target);
        target.toggleClass("active");
        Yith.settings.set("rememberMaster", target.hasClass("active"));
        if (!Yith.settings.get("rememberMaster")) {
            Yith.settings.set("masterPassword", undefined);
        }
    },

    changeMaster: function (evt) {
        "use strict";
        Yith.changeMasterPassword();
    },

    serverPreferencesUrl: function (evt) {
        "use strict";
        window.open(yithServerHost + "/preferences", "_blank");
    },

    useSymbols: function (evt) {
        "use strict";
        Yith.settings.set("passGenUseSymbols", $(evt.target).is(":checked"));
    },

    useNumbers: function (evt) {
        "use strict";
        Yith.settings.set("passGenUseNumbers", $(evt.target).is(":checked"));
    },

    useChars: function (evt) {
        "use strict";
        Yith.settings.set("passGenUseChars", $(evt.target).is(":checked"));
    },

    passLength: function (evt) {
        "use strict";
        Yith.settings.set("passGenLength", parseInt($(evt.target).val(), 10));
    }
});

// *********
// UTILITIES
// *********

Yith.initEditModal = function () {
    "use strict";
    if (Yith.editModal === undefined) {
        Yith.editModal = $("#edit");
        Yith.editModal.find("#secret-group #edit-secret1").pwstrength({
            viewports: {
                progress: Yith.editModal.find("#strength-meter .progressbar"),
                verdict: Yith.editModal.find("#strength-meter .verdict")
            }
        });
        Yith.editModal.modal({ show: false, keyboard: false });
        Yith.editModal.on("shown", function (evt) {
            $("#edit-tags").val("").typeahead({
                items: 3,
                source: function () {
                    return Yith.listPasswdView.get("allTags");
                }
            });
            if (!Yith.editView.isnew) {
                $("#secret-group").addClass("hide");
                $("#modify-secret-group").removeClass("hide");
            }
            Yith.editModal.find("#secret-group #edit-secret1").pwstrength("forceUpdate");
        });
        Yith.editModal.on("hidden", function (evt) {
            $("#edit-secret1").attr("value", "");
            $("#edit-secret2").attr("value", "");
        });
    }
};

Yith.addNewPassword = function () {
    "use strict";
    var now = new Date();
    Yith.initEditModal();
    Yith.editView.set("password", Yith.Password.create({
        creation: now.getTime(),
        last_modification: now.getTime()
    }));
    Yith.editView.set("isnew", true);
    Yith.editView.set("isExpirationDisabled", true);
    Yith.editModal.modal("show");
};

Yith.saveChangesInPassword = function (password, savePassword, callback) {
    "use strict";
    var enableExpiration = $("#edit-enable-expiration:checked").length > 0,
        now = new Date(),
        secret,
        expiration;

    password.set("service", $("#edit-service").val());
    password.set("account", $("#edit-account").val());
    password.set("last_modification", now.getTime());
    if (enableExpiration) {
        expiration = now.getTime() + (parseInt($("#edit-expiration").val(), 10) * 86400000);
        expiration = Math.round((expiration - password.get("creation")) / 86400000);
        password.set("expiration", expiration);
    } else {
        password.set("expiration", 0);
    }
    password.set("notes", $("#edit-notes").val());
    Yith.updateNotesPopover(password); // This can't be done using ember perks
    password.set("tags", password.get("provisionalTags"));

    if (savePassword) {
        Yith.askMasterPassword(function (masterPassword) {
            secret = $("#edit-secret1").val();
            try {
                secret = Yith.cipher(masterPassword, secret);
            } catch (err) {
                secret = null;
                return false;
            }
            password.set("secret", secret);
            secret = null;
            masterPassword = null;
            callback();
            return true;
        });
    } else {
        callback();
    }
};

Yith.updateNotesPopover = function (password) {
    "use strict";
    var node = $("#" + password.get("_id") + " button.notes");
    if (node.length > 0 && node.data().popover !== undefined) {
        if (password.get("notes") === "" || password.get("notes") === null) {
            node.popover("disable");
        } else {
            node.data().popover.options.content = password.get("notes");
            node.data().popover.options.title = password.get("service");
            node.popover("enable");
        }
    }
};

Yith.cloneList = function (list) {
    "use strict";
    var newlist = [];
    list.forEach(function (item) {
        newlist.push(item);
    });
    return newlist;
};

Yith.cipher = function (masterPassword, secret, notEnforce) {
    "use strict";
    var passwordList = Yith.listPasswdView.get("passwordList"),
        result;

    if (passwordList.length > 0 && !notEnforce) {
        // Enforce unique master password
        sjcl.decrypt(masterPassword, passwordList[0].get("secret"));
    }
    result = sjcl.encrypt(masterPassword, secret);
    masterPassword = null;
    return result;
};

Yith.decipher = function (masterPassword, cipheredSecret) {
    "use strict";
    var result = null;
    if (cipheredSecret !== null) {
        result = sjcl.decrypt(masterPassword, cipheredSecret);
    }
    masterPassword = null;
    return result;
};

Yith.askMasterPassword = function (callback, changeMaster) {
    "use strict";
    if (Yith.masterModal === undefined) {
        Yith.masterModal = $("#master");
        Yith.masterModal.modal({
            show: false
        });
        $("#master-password").keypress(function (evt) {
            var code = (evt.keyCode || evt.which);
            $("#master-error").hide();
            if (code === 13) { // Enter key
                $("#master-done").trigger("click");
            }
        });
        Yith.masterModal.on("shown", function (evt) {
            var backdrops = $(".modal-backdrop"),
                backdrop = $(backdrops[backdrops.length - 1]);

            backdrop.css("z-index", 1060);
            $("#master-error").hide();
            $("#master-password").focus();
        });
        Yith.masterModal.on("hidden", function (evt) {
            $("#master-password").attr("value", "");
            $("#new-master-password").attr("value", "");
        });
    }
    $("#master-done").unbind("click");
    $("#master-done").click(function () {
        var success = callback($("#master-password").val(), $("#new-master-password").val());
        if (success) {
            if (Yith.settings.get("rememberMaster") && $("#new-master-password").val() === "") {
                Yith.settings.set("masterPassword", $("#master-password").val());
                setTimeout(function () {
                    Yith.settings.set("masterPassword", undefined);
                }, 300000);
            }
            Yith.masterModal.modal("hide");
        } else {
            $("#master-error").show();
            $("#master-password").focus().select();
        }
    });
    if (changeMaster) {
        $(".change-master").show();
    } else {
        $(".change-master").hide();
        if (Yith.settings.get("rememberMaster") && Yith.settings.get("masterPassword") !== undefined) {
            callback(Yith.settings.get("masterPassword"));
            return;
        }
    }
    Yith.masterModal.modal("show");
};

Yith.changeMasterPassword = function () {
    "use strict";
    var passwordList = Yith.listPasswdView.get("passwordList");
    if (passwordList.length > 0) {
        Yith.askMasterPassword(function (masterPassword, newMasterPassword) {
            try {
                Yith.decipher(masterPassword, passwordList[0].get("secret"));
            } catch (err) {
                return false;
            }
            passwordList.forEach(function (password) {
                var secret = Yith.decipher(masterPassword, password.get("secret"));
                secret = Yith.cipher(newMasterPassword, secret, true);
                password.set("secret", secret);
                secret = null;
                Yith.ajax.updatePassword(password);
            });
            masterPassword = null;
            newMasterPassword = null;
            return true;
        }, true);
    }
};

Yith.setProgressBar = function (width) {
    "use strict";
    $("#page .progress .bar").css("width", width + "%");
};

// ****
// AJAX
// ****

Yith.ajax = {};

Yith.ajax.host = yithServerHost + "/passwords";
Yith.ajax.client_id_suffix = '?client_id=' + yithClientId;

Yith.ajax.getAccessToken = function (callback) {
    "use strict";
    $.ajax("/token", {
        success: function (data, textStatus, XHR) {
            Yith.ajax.accessCode = data.access_code;
            Yith.setProgressBar(70);
            callback();
        },
        error: function (XHR, textStatus, errorThrown) {
            $("#error").modal({ keyboard: false, backdrop: "static" });
            $("#error").find(".access").removeClass("hide");
            setTimeout(function () {
                window.open("/", "_self");
            }, 4000);
        }
    });
};

Yith.ajax.getPasswordList = function () {
    "use strict";
    $.ajax(Yith.ajax.host + Yith.ajax.client_id_suffix, {
        dataType: 'json',
        headers: {
            "Authorization": "Bearer " + Yith.ajax.accessCode
        },
        success: function (data) {
            Yith.setProgressBar(100);
            $("#page .progress").parent().remove();
            data.forEach(function (item) {
                var password = Yith.Password.create(item),
                    passwordList = Yith.cloneList(Yith.listPasswdView.get("passwordList"));
                passwordList.push(password);
                Yith.listPasswdView.set("passwordList", passwordList);
            });
            Yith.listPasswdView.set("initialized", true);
        },
        error: function (XHR, textStatus, errorThrown) {
            $("#error").modal({ keyboard: false, backdrop: "static" });
            $("#error").find(".access").removeClass("hide");
            setTimeout(function () {
                window.open("/", "_self");
            }, 4000);
        }
    });
};

Yith.ajax.createPassword = function (password) {
    "use strict";
    $.ajax(Yith.ajax.host + Yith.ajax.client_id_suffix, {
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + Yith.ajax.accessCode
        },
        data: password.get("json"),
        success: function (data, textStatus, XHR) {
            password.set("_id", data._id);
        },
        error: function (XHR, textStatus, errorThrown) {
            $("#error").modal({ keyboard: false, backdrop: "static" });
            $("#error").find(".failure").removeClass("hide");
            setTimeout(function () {
                window.open("/list", "_self");
            }, 4000);
        }
    });
};

Yith.ajax.updatePassword = function (password) {
    "use strict";
    var _id = password.get("_id");
    $.ajax(Yith.ajax.host + '/' + _id + Yith.ajax.client_id_suffix, {
        data: password.get("json"),
        dataType: "json",
        type: "PUT",
        headers: {
            "Authorization": "Bearer " + Yith.ajax.accessCode
        },
        error: function (XHR, textStatus, errorThrown) {
            $("#error").modal({ keyboard: false, backdrop: "static" });
            $("#error").find(".failure").removeClass("hide");
            setTimeout(function () {
                window.open("/list", "_self");
            }, 4000);
        }
    });
};

Yith.ajax.deletePassword = function (password) {
    "use strict";
    var _id = password.get("_id");
    $.ajax(Yith.ajax.host + '/' + _id + Yith.ajax.client_id_suffix, {
        type: "DELETE",
        headers: {
            "Authorization": "Bearer " + Yith.ajax.accessCode
        },
        error: function (XHR, textStatus, errorThrown) {
            $("#error").modal({ keyboard: false, backdrop: "static" });
            $("#error").find(".failure").removeClass("hide");
            setTimeout(function () {
                window.open("/list", "_self");
            }, 4000);
        }
    });
};

// **************
// INITIALIZATION
// **************

Yith.settings = Yith.Settings.create();

$(document).ready(function () {
    "use strict";

    // **********
    // INIT VIEWS
    // **********

    Yith.listPasswdView = Yith.ListPasswordsView.create().appendTo("#page div.password-list");

    Yith.editView = Yith.EditPasswordView.create().appendTo("#edit");

    Yith.settingsView = Yith.SettingsView.create().appendTo("#settings");

    Yith.setProgressBar(50);

    // *********
    // LOAD DATA
    // *********

    Yith.ajax.getAccessToken(Yith.ajax.getPasswordList);

    // ***********
    // SOME EVENTS
    // ***********

    Yith.creditsModal = $("#credits");
    Yith.creditsModal.modal({ show: false });
    $("#creditsButton").click(function () {
        Yith.creditsModal.modal("show");
    });
});
