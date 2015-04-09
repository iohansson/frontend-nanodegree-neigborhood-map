'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  require('time-grunt')(grunt);

  var appConfig = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({
    appConfig: appConfig,

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/**/*.js'
        ]
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= appConfig.dist %>/{,*/}*',
            '!<%= appConfig.dist %>/.git{,*/}*'
          ]
        }]
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: '{,*/}*.css',
          dest: '.tmp/css/'
        }]
      }
    },

    wiredep: {
      app: {
        src: ['<%= appConfig.app %>/index.html'],
        ignorePath: /\.\.\//
      }
    },

    filerev: {
      dist: {
        src: [
          '<%= appConfig.dist %>/js/{,*/}*.js',
          '<%= appConfig.dist %>/css/{,*/}*.css',
          '<%= appConfig.dist %>/css/fonts/*'
        ]
      }
    },

    useminPrepare: {
      html: '<%= appConfig.app %>/index.html',
      options: {
        dest: '<%= appConfig.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    usemin: {
      html: ['<%= appConfig.dist %>/**/*.html'],
      css: ['<%= appConfig.dist %>/css/**/*.css'],
      json: ['<%= appConfig.dist %>/data/**/*.json'],
      options: {
        assetsDirs: ['<%= appConfig.dist %>', '<%= appConfig.dist %>/img']
      }
    },

    cssmin: {
      dist: {
        files: {
          '<%= appConfig.dist %>/css/main.css': [
            '.tmp/css/{,*/}*.css'
          ]
        }
      }
    },

    uglify: {
      dist: {
        files: {
          '<%= appConfig.dist %>/js/scripts.js': [
            '<%= appConfig.dist %>/js/scripts.js'
          ]
        }
      }
    },

    concat: {
      dist: {}
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.app %>/img',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= appConfig.dist %>/img'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= appConfig.app %>/img',
          src: '{,*/}*.svg',
          dest: '<%= appConfig.dist %>/img'
        }]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= appConfig.dist %>',
          src: ['*.html', './**/*.html'],
          dest: '<%= appConfig.dist %>'
        }]
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= appConfig.app %>',
          dest: '<%= appConfig.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            './**/*.html',
            'img/{,*/}*.{webp}',
            'fonts/{,*/}*.*',
            'data/{,*/}*.json'
          ]
        }, {
          expand: true,
          cwd: '.tmp/img',
          dest: '<%= appConfig.dist %>/img',
          src: ['generated/*']
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= appConfig.app %>',
        dest: '.tmp/css/',
        src: ['css/*.css']
      }
    },

    concurrent: {
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin'
      ]
    },
    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      pages: {
        options: {
          remote: 'iohansson@github.com:iohansson/frontend-nanodegree-neighborhood-map.git',
          branch: 'gh-pages'
        }
      }
    }
  });

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin'
  ]);
};
