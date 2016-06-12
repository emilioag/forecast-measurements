var gulp = require('gulp'),
    connect = require('gulp-connect'),
    proxy = require('http-proxy-middleware');;

gulp.task('server', function () {
    connect.server({
        root: '.',
        hostname: '0.0.0.0',
        port: 8090,
        middleware: function(connect, opt) {
            return [
                proxy('/api', {
                    target: 'http://localhost:8081',
                    changeOrigin:true
                })
            ]
        }
    });
});

gulp.task('default', ['server']);