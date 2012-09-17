<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

    <title>Yith Library - Welcome!</title>
    <meta name="description" content="">
    <meta name="author" content="">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="shortcut icon" href="${request.static_path('yithwebclient:static/favicon.ico')}" />
    <link rel="stylesheet" href="${request.static_path('yithwebclient:static/css/bootstrap.min.css')}">
    <link rel="stylesheet" href="${request.static_path('yithwebclient:static/css/style.css')}">

    <!--[if lt IE 9]>
    <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
</head>
<body>
    <div id="page" class="container">
        <div class="row">
            <div class="span7">
                <div class="hero-unit">
                    <h1>Yith Library</h1>
                    <p>Secure service to store your passwords ciphered under a master password.</p>
                    <p>
                        <a href="${server_authorization_endpoint}" class="btn btn-primary btn-large pull-right">Enter</a>
                    </p>
                </div>
                <blockquote>
                    <p>I couldn't live a week without a private library.</p>
                    <small>H. P. Lovecraft</small>
                </blockquote>
            </div>
            <div class="span4 offset1">
                <img src="${request.static_path('yithwebclient:static/img/yithian.png')}" alt="Yithian" title="Yithian"/>
            </div>
        </div>
    </div>

    <div class="modal hide" id="credits">
        <div class="modal-header">
            <button class="close" data-dismiss="modal">&times;</button>
            <h3>Credits</h3>
        </div>
        <div class="modal-body">
            <p>Yith Library is copyright of:
                <ul>
                    <li><a href="http://mensab.com" target="_blank">Alejandro Blanco</a> &lt;alejandro.b.e at gmail.com&gt;</li>
                    <li><a href="http://lorenzogil.com/" target="_blank">Lorenzo Gil</a> &lt;lorenzo.gil.sanchez at gmail.com&gt;</li>
                    <li><a href="http://www.yaco.es" target="_blank">Yaco Sistemas S.L.</a></li>
                </ul>
                And is licensed under the terms of the <a href="http://www.gnu.org/licenses/agpl.html" target="_blank">GNU Affero General Public License</a>.
            </p>
            <hr />
            <p>Yithian image is copyright of <a href="http://narizpuntiaguda.com/" target="_blank">Isaac (Ismurg)</a> &lt;ismurg at gmail.com&gt; under the terms of the <a href="http://creativecommons.org/licenses/by-sa/3.0/" target="_blank">CC BY-SA 3.0</a></p>
            <hr />
            <p>Icons from <a href="http://glyphicons.com" target="_blank">Glyphicons Free</a> - <a href="http://creativecommons.org/licenses/by/3.0/" target="_blank">CC BY 3.0</a></p>
        </div>
        <div class="modal-footer">
            <a href="#" class="btn btn-primary" data-dismiss="modal">Close</a>
        </div>
    </div>

    <footer class="container">
        <ul class="pull-left">
            <li><a href="https://github.com/Yaco-Sistemas/yith-library-web-client" target="_blank">Fork us in GitHub!</a></li>
        </ul>
        <ul class="pull-right">
            <li><a href="#" id="creditsButton">Credits</a></li>
        </ul>
    </footer>

    <!-- The missing protocol means that it will match the current protocol, either http or https. If running locally, we use the local jQuery. -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src=\'${request.static_path("yithwebclient:static/js/libs/jquery-1.7.2.min.js")}\'><\/script>')</script>
    <script src="${request.static_path('yithwebclient:static/js/libs/bootstrap.min.js')}"></script>
    <script type="text/javascript">
        Yith = {};
        $(document).ready(function () {
            Yith.creditsModal = $("#credits");
            Yith.creditsModal.modal({ show: false });
            $("#creditsButton").click(function () {
                Yith.creditsModal.modal("show");
            });
        });
    </script>
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
</body>
</html>