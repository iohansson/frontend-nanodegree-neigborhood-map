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

    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: [
          '<%= appConfig.app %>/js/{,*/}*.js'
        ],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      styles: {
        files: ['<%= appConfig.app %>/css/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= appConfig.app %>/index.html',
          '.tmp/css/{,*/}*.css',
          '<%= appConfig.app %>/img/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= appConfig.dist %>'
        }
      }
    },

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
      },
      server: '.tmp'
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
      server: [
        'copy:styles'
      ],
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
          remote: 'git@github.com:iohansson/frontend-nanodegree-neighborhood-map.git',
          branch: 'gh-pages'
        }
      }
    }
  });
  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'wiredep',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
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
