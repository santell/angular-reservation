//jshint strict: false
module.exports = function(config) {
    config.set({

        basePath: './',

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-bootstrap/ui-bootstrap.min.js',
            'bower_components/angular-messages/angular-messages.min.js',
            'bower_components/angular-translate/angular-translate.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'dist/angular-reservation.js',
            'tests/**/*.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-spec-reporter',
            'karma-junit-reporter'
        ],

        reporters: ['spec'],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};