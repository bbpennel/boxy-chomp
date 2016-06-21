module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      options: {
        separator: ';\n'
      },
      dist: {
        src: ["src/module.js", "src/boxy/MapEntity.js", "src/boxy/CollectibleEntity.js", "src/boxy/CollectionEntity.js", 
          "src/boxy/CollectiblesManager.js", "src/boxy/MobileEntity.js", "src/boxy/GhostEntity.js", "src/boxy/StageMap.js",
          "src/boxy/SpriteFactory.js", "src/boxy/MapEntityFactory.js", "src/boxy/MapEntityManager.js",
          "src/boxy/EventHandler.js", "src/boxy/GameHud.js", "src/boxy/LevelState.js", "src/boxy/Utils.js", "src/game.js"],
        dest: "dist/boxy.js"
      }
    },
    /*jshint: {
      files: ['Gruntfile.js', 'src/*.js']
    },*/
    watch: {
      files: ['<%= concat.dist.src %>'],
      tasks: ['concat']
    }
  });

  /*grunt.loadNpmTasks('grunt-contrib-jshint');*/
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  //grunt.registerTask('default', ['jshint']);
  grunt.registerTask('default', ['concat']);

};