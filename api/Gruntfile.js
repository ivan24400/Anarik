module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    apidoc: {
      anarik: {
        src: "./routes",
        dest: "../docs/api"
      }
    },
    jsdoc: {
      dist : {
          src: ['./app/**/*.js'],
          dest: '../docs/app',
      }
    }
  });

  grunt.loadNpmTasks('grunt-apidoc');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('default', ['apidoc', 'jsdoc']);

};