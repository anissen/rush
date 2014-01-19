
BasicGame.Preloader = function (game) {

  this.background = null;
  this.preloadBar = null;

  this.ready = false;

};

BasicGame.Preloader.prototype = {

  preload: function () {
    //  These are the assets we loaded in Boot.js
    //  A nice sparkly background and a loading progress bar
    this.background = this.add.tileSprite(0, 0, 1024, 768, 'preloaderBackground');
    this.background.anchor.setTo(0.5, 0.5);
    this.preloadBar = this.add.sprite(256, 512, 'preloaderBar');
    //this.preloadBar.anchor.setTo(0.5, 0.5);

    //  This sets the preloadBar sprite as a loader sprite.
    //  What that does is automatically crop the sprite from 0 to full-width as the files below are loaded in.
    this.load.setPreloadSprite(this.preloadBar);

    //  Here we load the rest of the assets our game needs.
    //  As this is just a Project Template I've not provided these assets, the lines below won't work as the files themselves will 404, they are just an example of use.
    this.load.image('titlepage', 'assets/images/title.png');
    this.load.atlas('playButton', 'assets/images/button_texture_atlas.png', 'assets/images/button_texture_atlas.json');
    //this.load.audio('titleMusic', ['assets/music/main_menu.mp3']);
    this.load.bitmapFont('desyrel', 'assets/fonts/desyrel-pink.png', 'assets/fonts/desyrel-pink.xml');
    //this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
    //  + lots of other required assets here
    this.stage.backgroundColor = '#555555';

    loadingText = this.add.text(512, 570, 'Loading', { font: "30pt Courier", fill: "#ee0000", stroke: "#ffffff", strokeThickness: 5, align: 'center' });
    loadingText.anchor.setTo(0.5, 0.5);

    this.load.image('map', 'assets/images/map2.png');
    this.load.image('car', 'assets/images/car.png');
    this.load.image('patient', 'assets/images/firstaid.png');
    this.load.image('hospital', 'assets/images/spinObj_02.png');
    this.load.image('block', 'assets/images/block.png');
  },

  create: function () {
    //  Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
    this.preloadBar.cropEnabled = false;
    this.game.state.start('Game');
  },

  update: function () {
    //  You don't actually need to do this, but I find it gives a much smoother game experience.
    //  Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
    //  You can jump right into the menu if you want and still play the music, but you'll have a few
    //  seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
    //  it's best to wait for it to decode here first, then carry on.
    
    //  If you don't have any music in your game then put the game.state.start line into the create function and delete
    //  the update function completely.
    
    /*
    if (this.cache.isSoundDecoded('titleMusic') && this.ready === false) {
      this.ready = true;
      this.game.state.start('MainMenu');
    }
    */
  }

};
