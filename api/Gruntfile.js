module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    apidoc: {
      anarik: {
        src: "./routes",
        dest: "../docs/api"
      }
    }
  });

  grunt.loadNpmTasks('grunt-apidoc');

  grunt.registerTask('default', ['apidoc']);

};