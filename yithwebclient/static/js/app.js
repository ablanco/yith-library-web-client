/*jslint browser: true */
/*global Ember, Yith: true, DS, $ */

// Yith Library web client
// Copyright (C) 2012 - 2013  Alejandro Blanco <alejandro.b.e@gmail.com>
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
    window.Yith = Ember.Application.create({});
    // Wait until we have the access code
    Yith.deferReadiness();

    Yith.Router.map(function () {
        this.resource('passwords', { path: '/' }, function () {
            this.route('new');
            this.resource('password', {
                path: ':password_id'
            });
        });
    });

    Yith.PasswordsIndexRoute = Ember.Route.extend({
        model: function () {
            return this.store.find('password');
        },

        enter: function () {
            $("#top-bar").removeClass("hide");
        }
    });

    Yith.PasswordsNewRoute = Ember.Route.extend({
        model: function () {
            return this.store.createRecord('password');
        },

        enter: function () {
            $("#top-bar").addClass("hide");
            $("#advanced-options").addClass("hide");
        }
    });

    Yith.PasswordRoute = Ember.Route.extend({
        model: function (params) {
            return this.store.find('password', params.password_id);
        },

        enter: function () {
            $("#top-bar").addClass("hide");
            $("#advanced-options").addClass("hide");
            var controller = this.get("controller");
            if (controller) {
                // If the controller has already been created then it's
                // possible that it is showing the modify-secret controls
                controller.set("modifySecret", false);
            }
        }
    });

    // INITIALIZATION CODE
    $(document).ready(function () {
        var creditsModal,
            setProgressBar;

        setProgressBar = function (width) {
            $("#loading .progress .bar").css("width", width + "%");
        };

        $.ajax("/token", {
            success: function (data) {
                window.yithAccessCode = data.access_code;
                setProgressBar(100);
                Yith.advanceReadiness();
                $("#loading").remove();
            },
            error: function () {
                $("#error").find(".access").removeClass("hide");
                $("#error").modal({ keyboard: false, backdrop: "static" });
                setTimeout(function () {
                    window.open("/", "_self");
                }, 4000);
            }
        });

        creditsModal = $("#credits");
        creditsModal.modal({ show: false });
        $("#creditsButton").click(function () {
            creditsModal.modal("show");
        });

        setProgressBar(60);
    });
}());
