/*jslint browser: true */
/*global Ember, Yith */

// Yith Library web client
// Copyright (C) 2012 - 2014  Alejandro Blanco <alejandro.b.e@gmail.com>
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


(function (Yith, Ember) {
    "use strict";

    Yith.SecretGroup = Ember.View.extend({
        templateName: "secret-group",
        checkerList: [],

        validateSecret: function () {
            var $form = this.$().parents("form"),
                that = this;
            while (this.get("checkerList").length > 0) {
                clearTimeout(this.get("checkerList").pop());
            }
            this.get("checkerList").push(setTimeout(function () {
                that.get("controller").validateSecretChecker($form);
            }, 500));
        },

        initStrengthMeter: function (insist) {
            var input = this.$().find("#edit-secret1"),
                that = this;
            if (input.length > 0) {
                input.pwstrength({
                    ui: {
                        viewports: {
                            progress: this.$().find("#strength-meter .progressbar"),
                            verdict: this.$().find("#strength-meter .verdict")
                        },
                        bootstrap2: true
                    }
                });
            } else if (insist) {
                setTimeout(function () {
                    that.initStrengthMeter(true);
                }, 100);
            }
        },

        bindValidation: function (insist) {
            var inputs = this.$().find(".edit-secret"),
                that = this;
            if (inputs.length > 0) {
                inputs.on("keyup", function () {
                    that.validateSecret();
                });
            } else if (insist) {
                setTimeout(function () {
                    that.bindValidation(true);
                }, 100);
            }
        },

        didInsertElement: function () {
            var that = this;

            this.initStrengthMeter(false);

            // This cannot be done with ember and handlebars' actions because
            // an unknown reason, I couldn't make it work
            this.bindValidation(false);
            this.$().find("#show-secret-group").on("click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                that.get("controller").set("modifySecret", true);
                that.bindValidation(true);
                that.initStrengthMeter(true);
            });
        }
    });

    Yith.GenerateSecretButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn"],

        click: function (evt) {
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

            this.$().parent()
                .find("#edit-secret2").val(password).end()
                .find("#edit-secret1").val(password).trigger("keyup");
            password = null;
        }
    });

    Yith.TagsInput = Ember.View.extend({
        templateName: "tags-input",

        addTag: function () {
            var tags = this.$().find("input").val().split(',');
            this.get("controller").addProvisionalTags(tags);
            this.$().find("input").val("");
        },

        didInsertElement: function () {
            var that = this;

            this.$().find("input").typeahead({
                items: 3,
                source: function () {
                    return that.get('controller.controllers.passwordsIndex.allTags');
                }
            });

            // This cannot be done with ember and handlebars' actions because
            // an unknown reason, I couldn't make it work
            this.$().find("button").on("click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                that.addTag();
            });
        }
    });

    Yith.SaveButton = Ember.View.extend({
        tagName: "button",
        classNames: ["btn", "btn-primary"],

        click: function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            this.get("controller").save(this.$().parents("form"));
        }
    });
}(Yith, Ember));
