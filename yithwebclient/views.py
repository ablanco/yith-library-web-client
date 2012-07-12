# Yith Library web client
# Copyright (C) 2012  Yaco Sistemas S.L.

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config

import requests

@view_config(route_name='index', renderer='index.mak')
def index(request):
    url = request.registry.settings['yith.server'] + "/oauth2/endpoints/authorization?response_type=code&client_id=" + request.registry.settings['yith.client_id']
    return {'server_authorization_endpoint': url}

@view_config(route_name='oauth2cb')
def oauth2cb(request):
    url = request.registry.settings['yith.server'] + "/oauth2/endpoints/token"
    payload = 'grant_type=authorization_code&code=' + request.GET.get('code')
    basic_auth = (request.registry.settings['yith.client_id'], request.registry.settings['yith.client_secret'])
    response = requests.post(url, data=payload, auth=basic_auth)

    data = response.json

    session = request.session
    session['access_code'] = data['access_code']
    return HTTPFound(location=request.route_url('list'))

@view_config(route_name='token', renderer='json')
def get_token(request):
    access_code = request.session['access_code']
    return {'access_code': access_code}

@view_config(route_name='list', renderer='list.mak')
def list_passwords(request):
    return {'server_host': request.registry.settings['yith.server']}
