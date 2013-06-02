/*jslint browser: true, nomen: true */
/*global Ember, $, Yith, sjcl, yithServerHost */

// Yith Library web client
// Copyright (C) 2012 - 2013  Alejandro Blanco <alejandro.b.e@gmail.com>
// Copyright (C) 2012  Yaco Sistemas S.L.
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


(function () {
    "use strict";

    Yith.ViewsUtils = {
        askMasterPassword: function (callback, changeMaster) {
            var firstTime = Yith.ViewsUtils.masterModal === undefined,
                $master,
                $newMaster;

            // Initialize the modal only once
            if (firstTime) {
                Yith.ViewsUtils.masterModal = $("#master");
                Yith.ViewsUtils.masterModal.modal({
                    show: false
                });
            }

            $master = Yith.ViewsUtils.masterModal.find("#master-password");
            $newMaster = Yith.ViewsUtils.masterModal.find("#new-master-password");

            if (firstTime) {
                $master.keypress(function (evt) {
                    var code = (evt.keyCode || evt.which);
                    Yith.ViewsUtils.masterModal.find("#master-error").hide();
                    if (code === 13) { // The "Enter" key
                        Yith.ViewsUtils.masterModal.find("#master-done").trigger("click");
                    }
                });

                Yith.ViewsUtils.masterModal.on("shown", function () {
                    Yith.ViewsUtils.masterModal.find("#master-error").hide().end()
                                               .find("#master-password").focus();
                });

                Yith.ViewsUtils.masterModal.on("hidden", function () {
                    $master.val("");
                    $newMaster.val("");
                });
            }

            Yith.ViewsUtils.masterModal.find("#master-done")
                .off("click")
                .on("click", function () {
                    var success = callback(
                        $master.val(),
                        $newMaster.val()
                    );

                    if (success) {
                        if (Yith.settings.get("rememberMaster") && $master.val() !== "") {
                            Yith.settings.set("masterPassword", $master.val());
                            setTimeout(function () {
                                Yith.settings.set("masterPassword", undefined);
                            }, 300000); // 5 min
                        }
                        Yith.ViewsUtils.masterModal.modal("hide");
                        $master.val("");
                        $newMaster.val("");
                    } else {
                        Yith.ViewsUtils.masterModal.find("#master-error").show().end()
                                                   .find("#master-password").focus().select();
                    }
                });

            if (changeMaster) {
                Yith.ViewsUtils.masterModal.find(".change-master").show();
            } else {
                Yith.ViewsUtils.masterModal.find(".change-master").hide();
                if (Yith.settings.get("rememberMaster") && Yith.settings.get("masterPassword") !== undefined) {
                    callback(Yith.settings.get("masterPassword"));
                    return;
                }
            }

            Yith.ViewsUtils.masterModal.modal("show");
        },

        decipher: function (masterPassword, cipheredSecret) {
            var result = null;
            if (cipheredSecret !== null) {
                result = sjcl.decrypt(masterPassword, cipheredSecret);
            }
            masterPassword = null;
            return result;
        }
    };

    // GLOBAL VIEWS

    Yith.DisableCountdownButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn"],

        click: function (evt) {
            var $target = $(evt.target);
            $target.toggleClass("active");
            Yith.settings.set("disableCountdown", $target.hasClass("active"));
        }
    });

    Yith.RememberMasterButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn"],

        click: function (evt) {
            var $target = $(evt.target);
            $target.toggleClass("active");
            Yith.settings.set("rememberMaster", $target.hasClass("active"));
            if (!Yith.settings.get("rememberMaster")) {
                Yith.settings.set("masterPassword", undefined);
            }
        }
    });

    Yith.ShowAdvancedButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn"],

        click: function () {
            var $advanced = $("#advanced-options");
            if ($advanced.hasClass("hide")) {
                $advanced.removeClass("hide").addClass("row");
            } else {
                $advanced.removeClass("row").addClass("hide");
            }
        }
    });

    Yith.ServerPreferencesButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn", "pull-right"],

        click: function () {
            window.open(yithServerHost + "/preferences", "_blank");
        }
    });

    Yith.ChangeMasterButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn"]

//         click: function (evt) {
//             // TODO
//         }
    });

    Yith.PasswordLengthInput = Ember.View.extend({
        tagName: "input",
        attributeBindings: ["type", "min", "step", "value"],
        type: "number",
        min: 0,
        step: 1,
        value: 20,
        classNames: ["span2"],

        change: function (evt) {
            Yith.settings.set("passGenLength", parseInt($(evt.target).val(), 10));
        }
    });

    // LIST PASSWORDS' ITEMS VIEWS

    Yith.ServiceButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn btn-info"],

        click: function (evt) {
            Yith.ViewsUtils.askMasterPassword(function (masterPassword) {
                var $node = $(evt.target).parents("tr"),
                    $input = $node.find("td:first-child input"),
                    $countdown = $node.find("td:first-child span"),
                    $close = $countdown.next(),
                    secret = Yith.Password.find($node.attr("id")),
                    timer;

                try {
                    secret = Yith.ViewsUtils.decipher(masterPassword, secret.get("secret"));
                } catch (err) {
                    return false;
                }
                masterPassword = null;
                $input.val(secret).show().focus().select();
                secret = null;

                if (Yith.settings.get("disableCountdown")) {
                    $close.off("click");
                    $close.click(function () {
                        $input.hide().attr("value", "");
                        $close.hide();
                    });
                    $close.show();
                } else {
                    $countdown.text("5");
                    $countdown.show();
                    timer = setInterval(function () {
                        $countdown.text(parseInt($countdown.text(), 10) - 1);
                    }, 1000);
                    setTimeout(function () {
                        clearInterval(timer);
                        $input.hide().attr("value", "");
                        $countdown.hide();
                    }, 5500);
                }
                return true;
            });
        }
//
//         filterByTag: function (evt) {
//             // TODO controller.activateFilter($(evt.target).text());
//         },
//
//         removeFilter: function (evt) {
//             var target = evt.target;
//             if (target.tagName === "I") {
//                 target = target.parentNode;
//             }
//             // TODO controller.deactivateFilter($(target).text().trim());
//         },
//
//         edit: function (evt) {
//             var password = evt.context;
//             Yith.initEditModal();
//             password.set("provisionalTags", password.get("tags"));
//             Yith.editView.set("password", password);
//             Yith.editView.set("isnew", false);
//             Yith.editView.set("isExpirationDisabled", password.get("expiration") <= 0);
//             Yith.editModal.modal("show");
//         }
    });

    Yith.TagButton = Ember.View.extend({
        tagName: "span",
        classNames: ["label", "pointer"],

        click: function () {
            var controller = Yith.__container__.lookup("controller:PasswordsIndex");
            controller.activeFilters.push(this.$().text());
        }
    });

    Yith.FilterButton = Yith.TagButton.extend({
        click: function () {
            var controller = Yith.__container__.lookup("controller:PasswordsIndex");
//             controller.activeFilters.push(this.$().text()); TODO
        }
    });

    Yith.NotesButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn", "notes"],

        didInsertElement: function () {
            var id = this.$().parents("tr").attr("id"),
                notes = Yith.Password.find(id).get("notes");

            if (notes !== "") {
                this.$().popover({
                    placement: "left",
                    title: "Notes",
                    content: notes
                });
            } else {
                this.$().addClass("disabled");
            }
        }
    });
}());
