
BasicGame.MainMenu = function (game) {

};

BasicGame.MainMenu.prototype = {
  create: function () {
    this.add.sprite(0, 0, 'titlepage');
    console.log(BasicGame.score);
    if (BasicGame.score) {
      var scoreText = this.add.text(512, 350, 'Game over!\n\nYou rescued ' + BasicGame.score + ' patient' + (BasicGame.score > 1 ? 's' : ''), { font: "bold 32px Verdana", fill: "#FF4136", stroke: "#FFFFFF", strokeThickness: 3 });
      scoreText.anchor.setTo(0.5, 0.5);
    }

    this.addButton(512, 520, 'How To Play', this.howToPlay);
    this.addButton(512, 650, 'Play', this.startGame);
  },

  addButton: function(x, y, text, callback) {
    var btn = this.add.button(x, y, 'button', callback, this);
    btn.anchor.setTo(0.5, 0.5);
    btn.scale.setTo(0.6, 0.5);

    var txt = this.add.text(x, y, text, { font: "bold 32px Verdana", fill: "#FF4136", stroke: "#FFFFFF", strokeThickness: 3 });
    txt.anchor.setTo(0.5, 0.5);
  },

  update: function () {
    //  Do some nice funky main menu effect here
  },

  howToPlay: function() {
    this.game.state.start('HowToPlay');
  },

  startGame: function() {
    this.game.state.start('Game');
  }
};
