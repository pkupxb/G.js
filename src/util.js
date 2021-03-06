(function (G) {
    var util = G.util = {};
    var MULTIPLE_SLASH_RE = /([^:\/])\/\/+/g;
    var DIRNAME_RE = /.*(?=\/.*$)/;

    util.path ={
        idToUrl: function ( id ) {
            var url, version, now;
            if ( util.path.isAbsolute( id ) ) {
                return id;
            }

            version = G.config( 'version' );

            if (version) {
                if ( ! version[ id ] ) {
                    now = Date.now();
                    version = now -  ( now % G.config( 'cacheExpire' ) );
                } else {
                    version = version[ id ];
                }

                url = id.replace( /\.(\w*)$/, '-' + version + '.$1');
            } else {
                url = id;
            }

            return util.path.realpath( G.config('baseUrl') + url );
        },
        dirname: function ( url ) {
            var match = url.match(DIRNAME_RE);
            return (match ? match[0] : '.') + '/';
        },
        isAbsolute: function ( url ) {
            return url.indexOf('://') > 0 || url.indexOf('//') === 0;
        },
        isRelative: function ( url ) {
            return url.indexOf('./') === 0 || url.indexOf('../') === 0;
        },
        realpath: function (path) {
            MULTIPLE_SLASH_RE.lastIndex = 0;

            // 'file:///a//b/c' ==> 'file:///a/b/c'
            // 'http://a//b/c' ==> 'http://a/b/c'
            if (MULTIPLE_SLASH_RE.test(path)) {
                path = path.replace(MULTIPLE_SLASH_RE, '$1\/');
            }

            // 'a/b/c', just return.
            if (path.indexOf('.') === -1) {
                return path;
            }

            var original = path.split('/');
            var ret = [], part;

            for (var i = 0; i < original.length; i++) {
                part = original[i];

                if (part === '..') {
                    if (ret.length === 0) {
                        throw new Error('The path is invalid: ' + path);
                    }
                    ret.pop();
                } else if (part !== '.') {
                    ret.push(part);
                }
            }

            return ret.join('/');
        }
    };
}) (G);