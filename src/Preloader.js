
BasicGame.Preloader = function (game) {

};

BasicGame.Preloader.prototype = {
  preload: function () {
    this.stage.backgroundColor = '#000000';

    this.loadingText = this.add.text(512, 570, 'Loading', { font: "30pt Courier", fill: "#ee0000", stroke: "#ffffff", strokeThickness: 5, align: 'center' });
    this.loadingText.anchor.setTo(0.5, 0.5);

    this.load.image('map', 'assets/images/bigmap.jpg');
    this.load.image('car', 'assets/images/ambulance.png');
    this.load.image('patient', 'assets/images/firstaid.png');
    this.load.image('hospital', 'assets/images/spinObj_02.png');
    this.load.image('block', 'assets/images/block.png');
    this.load.image('red', 'assets/images/red.png');
  },

  create: function () {
    this.game.state.start('Game');
  },

  update: function () {
    this.loadingText.setContents = 'Loading ' + this.load.progress + '%';
  }
};
