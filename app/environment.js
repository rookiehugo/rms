var path = require('path');
var less = require('less-middleware');

module.exports = function(app, express) {
    app.set('views', path.join(__dirname, 'jade'));
    app.set('view engine', 'jade');
    app.locals.nodeEnv = process.env.NODE_ENV || 'development';
    app.use(express.favicon(path.join(__dirname, '..', 'static', 'images', 'resume.ico')));
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.errorHandler());
    app.use(express.cookieParser('rms is very cool'));
    app.use(express.session());
    app.use(app.router);

    if ('development' === app.get('env')) {
        app.use(less({
            dest: path.join(__dirname, '../static', 'css'),
            src: path.join(__dirname, '..', 'assets', 'less'),
            prefix: '/static/css'
        }));
        app.use(express.logger('dev'));
        app.locals.pretty = true;
        app.use('/static', express.static(path.join(__dirname, '..', 'static')));
        app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
    };

    if ('production' === app.get('env')) {
        app.use('/static', express.static(path.join(__dirname, '..', 'static')));
        app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
    };
}