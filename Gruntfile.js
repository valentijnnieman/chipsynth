module.exports = function(grunt)
{
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      serve: {
        options: {
          port: 9000,
          hostname: '192.168.0.18'
        }
      }
  });
  
  grunt.loadNpmTasks('grunt-serve');
  grunt.registerTask('default');
};
