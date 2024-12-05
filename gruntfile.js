/* Derived from https://gist.github.com/alexilyaev/cf7d56f105046400fcc8 */

module.exports = function (grunt) {
  'use strict'

  const sass = require('sass')
  require('load-grunt-tasks')(grunt)

  // Project configuration.
  grunt.initConfig({
    // Read settings from package.json
    pkg: grunt.file.readJSON('package.json'),
    // Paths settings
    dirs: {
      src: {
        sass: './build/css/sass',
        css: './build/css',
        js: './build/js',
      },
      dest: {
        css: './public/css',
        js: './public/js',
      },
    },
    // Check that all JS files conform to our `.jshintrc` files
    jshint: {
      options: {
        jshintrc: true,
      },
      target: {
        src: '<%= dirs.src.js %>/**/*.js',
      },
    },
    sass: {
      options: {
        implementation: sass,
        outputStyle: 'compressed',
        sourceMap: true,
      },
      target: {
        src: '<%= dirs.src.sass %>/app.scss',
        dest: '<%= dirs.src.css %>/app.css',
      },
    },
    // Combine CSS
    cssmin: {
      options: {
        keepSpecialComments: 0,
      },
      target: {
        files: [
          {
            expand: true,
            useGzip: true,
            cwd: '<%= dirs.src.css %>',
            src: ['app.css'],
            dest: '<%= dirs.dest.css %>',
            ext: '.min.css',
          },
        ],
      },
    },
    // Combine all JS files into one compressed file (including sub-folders)
    uglify: {
      options: {
        banner:
          '/*! <%= pkg.name %> ' +
          '<%= grunt.template.today("dd-mm-yyyy") %> */\n',
        compress: true,
        mangle: true,
        sourceMap: true, //change to true for dev
      },
      main_js: {
        src: ['<%= dirs.src.js %>/app.js'],
        dest: '<%= dirs.dest.js %>/app.min.js',
      },
    },
    // Trigger relevant tasks when the files they watch has been changed
    // This includes adding/deleting files/folders as well
    watch: {
      configs: {
        options: {
          reload: true,
        },
        files: ['Gruntfile.js', 'package.json'],
      },
      css: {
        files: '<%= dirs.src.css %>/sass/**/*.scss',
        tasks: ['build-css'],
      },
      js: {
        files: '<%= dirs.src.js %>/**/*.js',
        tasks: ['build-js'],
      },
    },
  })

  // Setup build tasks aliases
  grunt.registerTask('build-js', ['jshint', 'uglify:main_js'])
  grunt.registerTask('build-css', ['sass', 'cssmin'])
  grunt.registerTask('build', ['build-js', 'build-css'])

  // Default task(s).
  grunt.registerTask('default', ['build'])
}
