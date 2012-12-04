<%inherit file="base.mak"/>

<%def name="title()">Your passwords</%def>

<%def name="extraheader()">
    <script type="text/javascript">
        var yithServerHost = "${server_host}";
    </script>
</%def>

<%def name="mainbody()">
    <div class="navbar container"><div class="navbar-inner">
        <a class="brand" href="/list">Yith Library Web Client</a>
        <ul class="nav pull-right">
            <li><a href="${server_host}/profile">Profile</a></li>
            <li><a href="/logout">Log out</a></li>
        </ul>
    </div></div>

    <%text>
    <script type="text/x-handlebars" data-template-name="password-list">
        {{#if passwordListLength }}
        <div class="span12">
            <b>All tags (filter by):</b>
            <ul id="tag-list" class="unstyled">
                {{#each allTags}}
                <li><span class="label pointer" {{action "filterByTag"}}>{{this}}</span></li>
                {{/each}}
            </ul>
            {{#if activeFiltersLength}}
            <div id="filter">
                <b>Active filters:</b>
                {{#each activeFilters}}
                <span class="label pointer" {{action "removeFilter"}}><i class="icon-remove" {{action "removeFilter"}}></i> {{this}}</span>
                {{/each}}
            </div>
            {{/if}}
            <table class="table table-striped passwords">
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Account</th>
                    <th>Tags</th>
                    <th>Expiration</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {{#each processedPasswordList}}
                    <tr {{bindAttr id="_id"}}>
                        <td>
                            <button class="btn btn-info" {{action "getPassword"}}>{{service}}</button>
                            <input type="text" style="display: none;" class="input-medium" /> <span style="display: none;" ></span><i style="display: none;" class="pointer icon-remove" >&times;</i>
                        </td>
                        <td>{{account}}</td>
                        <td>{{#each tags}}
                        <span class="label pointer" {{action "filterByTag"}}>{{this}}</span>
                        {{/each}}</td>
                        <td>
                            {{#if expiration}}
                            <span {{bindAttr class="expirationClass"}}>{{daysLeft}}</span>
                            {{else}}
                            <span class="badge">Never</span>
                            {{/if}}
                        </td>
                        <td><button {{bindAttr class="notesClass"}} {{action "notes" on="mouseEnter"}} ><i class="icon-exclamation-sign"></i> Notes</button></td>
                        <td><button class="btn btn-warning" {{action "edit"}}><i class="icon-white icon-edit"></i> Edit</button></td>
                    </tr>
                {{/each}}
            </tbody>
            </table>
        </div>
        {{else}}
        <div class="span6 offset3">
            <div class="alert alert-info">
                <h3>No passwords stored yet</h3>
                <p>Please, add a password using the button.</p>
            </div>
        </div>
        {{/if}}
    </script>
    <script type="text/x-handlebars" data-template-name="password-edit">
        <div class="modal-header">
            <button class="close" data-dismiss="modal">&times;</button>
            {{#if isnew}}
            <h3>Add new password</h3>
            {{else}}
            <h3>Edit password</h3>
            {{/if}}
        </div>
        <div class="modal-body" id="edit-body">
            <form>
                <div class="control-group">
                    <label class="control-label" for="edit-service"><span class="red">*</span> Service</label>
                    <input type="text" id="edit-service" {{bindAttr value="password.service"}} {{action "checkEmptiness" on="change"}}/>
                    <span class="help-block" style="display: none;">This field is required</span>
                </div>
                <label for="edit-account">Account</label>
                <input type="text" id="edit-account" {{bindAttr value="password.account"}}/>
                <div {{bindAttr class="isnew:hide :control-group"}} id="modify-secret-group">
                    <a href="#" class="btn" {{action "showSecretGroup"}}>Modify password</a>
                </div>
                <div {{bindAttr class="secretGroupClass"}} id="secret-group">
                    <label class="control-label" for="edit-secret1">{{#if isnew}}<span class="red">*</span> {{/if}}Secret</label>
                    <div class="controls form-inline">
                        <input type="password" id="edit-secret1" class="input-small" {{action "validateSecret" on="keyUp"}}/> <input type="password" id="edit-secret2" class="input-small" {{action "validateSecret" on="keyUp"}} placeholder="Repeat"/> <button class="btn hide"><i class="icon icon-cog"></i> Generate</button>
                    </div>
                    <span class="help-block match" style="display: none;">The passwords don't match</span>
                    <span class="help-block req" style="display: none;">This field is required</span>
                </div>
                <div class="control-group">
                    <div class="controls form-inline">
                        <label class="checkbox">
                            <input type="checkbox" id="edit-enable-expiration" {{bindAttr checked="isExpirationEnabled"}} {{action "enableExpiration" on="change"}}/> Expirate in
                        </label> <input type="number" id="edit-expiration" class="input-mini" min="0" {{bindAttr disabled="isExpirationDisabled"}} {{bindAttr value="password.daysLeft"}} /> days
                    </div>
                </div>
                <div class="control-group">
                    <label class="control-label" for="edit-tags">Tags</label>
                    <div class="controls">
                        <div class="input-append">
                            <input type="text" id="edit-tags" autocomplete="off" /><button class="btn" {{action "addTag"}}><i class="icon icon-plus"></i> Add</button>
                        </div>
                        <ul>
                        {{#each tag in password.provisionalTags}}
                            <li>{{tag}} <i class="icon-remove pointer" {{action "removeTag" context="tag"}}></i></li>
                        {{/each}}
                        </ul>
                    </div>
                </div>
                <label for="edit-notes">Notes</label>
                <textarea id="edit-notes" class="input-xlarge" rows="3" {{bindAttr value="password.notes"}}></textarea>
            </form>
        </div>
        <div class="modal-footer">
            {{#unless isnew}}
            <a href="#" class="btn btn-danger pull-left" {{action "deletePassword"}}>Delete</a>
            {{/unless}}
            <a href="#" class="btn" data-dismiss="modal">Close</a>
            {{#if isnew}}
            <a href="#" class="btn btn-primary" {{action "createPassword"}}>Create</a>
            {{else}}
            <a href="#" class="btn btn-primary" {{action "saveChanges"}}>Save changes</a>
            {{/if}}
        </div>
    </script>
    </%text>

    <div id="page" class="container">
        <div class="row">
            <div class="span3">
                <button class="btn" onclick="Yith.addNewPassword();"><i class="icon-plus"></i> Add new password</button>
            </div>
            <div class="span9"><div class="pull-right">
                <button class="btn" id="change-master">Change master password</button>
                <button class="btn" id="disable-countdown">Disable countdown</button>
                <button class="btn" id="remember-master">Remember master password</button>
            </div></div>
        </div>
        <div class="row password-list"></div>
        <div class="row">
            <div class="span4 offset4 progress progress-striped active">
                <div class="bar" style="width: 10%;"></div>
            </div>
        </div>
    </div>

    <div class="modal fade hide" id="edit"></div>

    <div class="modal hide" id="master">
        <div class="modal-header">
            <button class="close" data-dismiss="modal">&times;</button>
            <h3>Master Password</h3>
        </div>
        <div class="modal-body">
            <form>
                <label for="master-password" class="change-master">Old password</label>
                <input type="password" id="master-password"/>
                <label for="new-master-password" class="change-master">New password</label>
                <input type="password" id="new-master-password" class="change-master" style="display: none;"/>
            </form>
            <div class="alert alert-error" id="master-error" style="display: none;">
                <h4>Wrong password!</h4>
                That's not your master password, try another.
            </div>
        </div>
        <div class="modal-footer">
            <a href="#" class="btn" data-dismiss="modal">Cancel</a>
            <a href="#" class="btn btn-primary" id="master-done">Accept</a>
        </div>
    </div>

    <div class="modal hide" id="error">
        <div class="modal-header">
            <h3 class="access hide">Session expired</h3>
            <h3 class="failure hide">Something failed</h3>
        </div>
        <div class="modal-body">
            <div class="alert alert-error access hide">
                <h4>You are about to logout</h4>
                In a few seconds you'll be redirected to the welcome page to login again.
            </div>
            <div class="alert alert-error failure hide">
                <h4>Don't panic!</h4>
                The page will refresh in a few seconds. Everything will be ok, you may loose the lastest changes though.
            </div>
        </div>
    </div>
</%def>

<%def name="extrabody()">
    <script src="${request.static_path('yithwebclient:static/js/libs/ember-0.9.8.1.min.js')}"></script>
    <script src="${request.static_path('yithwebclient:static/js/libs/sjcl.js')}"></script>
    <script src="${request.static_path('yithwebclient:static/js/app.js')}"></script>

    % if google_analytics is not None:
    <script type="text/javascript">
        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', '${google_analytics}']);
        _gaq.push(['_trackPageview']);

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();
    </script>
    % endif
</%def>