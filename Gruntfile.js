// - -------------------------------------------------------------------- - //
module.exports = function(grunt) {

  grunt.initConfig({

    browserify: {      
      build: {
        files: {
          "./www/index.js": "./src/index.js",
        },
      },      
    },
    
    watch: {
      js: {
        files: ["./src/**/*.js"],
        tasks: ["browserify:build"],
        options: {
          spawn: false,
        },
      },
    },

  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  
  grunt.registerTask("build",[
    "browserify:build",	
  ]);

};
// - -------------------------------------------------------------------- - //
