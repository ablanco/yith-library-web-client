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

import os
import sys
PY3 = sys.version_info[0] == 3

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))

if PY3:
    def open_file(path):
        return open(path, encoding='utf-8')
else:
    def open_file(path):
        return open(path)

README = open_file(os.path.join(here, 'README.rst')).read()
CHANGES = open_file(os.path.join(here, 'CHANGES.rst')).read()


requires = [
    'PasteDeploy==1.5.2',       # required by pyramid
    'repoze.lru==0.6',          # required by pyramid
    'translationstring==1.1',   # required by pyramid
    'venusian==1.0',            # required by pyramid
    'WebOb==1.4',               # required by pyramid
    'zope.interface==4.1.1',    # required by pyramid
    'Mako==1.0.1',              # required by pyramid_mako

    'pyramid_mako==1.0.2',
    'pyramid==1.5.4',
    'requests==2.7.0',
    'waitress==0.8.9',
]

setup(
    name='yith-web-client',
    version='1.0.2',
    description='yith-web-client',
    long_description=README + '\n\n' + CHANGES,
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Programming Language :: Python",
        "Framework :: Pyramid",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        "License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)",
    ],
    author='Alejandro Blanco',
    author_email='alejandro.b.e@gmail.com',
    url='http://yithlibrary.com',
    keywords='web pyramid yith security password cyrpto',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=requires,
    tests_require=requires,
    test_suite="yithwebclient",
    entry_points="""\
    [paste.app_factory]
    main = yithwebclient:main
    """,
)
