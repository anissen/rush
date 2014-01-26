
BasicGame.HowToPlay = function (game) {
	// this.playButton = null;
};

BasicGame.HowToPlay.prototype = {
	create: function () {
		this.add.sprite(0, 0, 'titlepage');

    var text = 'Rescue as many patients as possible!\n______________________________\n\nControls:\n• Drag ambulance to patients to pick them up\n• Drag ambulance to the hospital to drop patients off\n\nTips:\n• A patient dies when the timer runs out\n• Avoid buildings as they slow you down';

    var howToText = this.add.text(512, 400, text, { font: "bold 24px Verdana", fill: "#FF4136", stroke: "black", strokeThickness: 3 });
    howToText.anchor.setTo(0.5, 0.5);

		this.addButton(512, 650, 'Back', this.toMainMenu);
	},

	addButton: function(x, y, text, callback) {
		var btn = this.add.button(x, y, 'button', callback, this);
    btn.anchor.setTo(0.5, 0.5);
		btn.scale.setTo(0.6, 0.5);

		var txt = this.add.text(x, y, text, { font: "bold 32px Verdana", fill: "#FF4136", stroke: "#FFFFFF", strokeThickness: 3 });
    txt.anchor.setTo(0.5, 0.5);

    /*
    this.add.tween(btn)
      .to({ rotation: -Math.PI / 100, y: y + 5 }, 2000, Phaser.Easing.Quadratic.InOut)
      .to({ rotation: Math.PI / 100, y: y - 5 }, 2000, Phaser.Easing.Quadratic.InOut)
      .loop()
      .start();

    this.add.tween(txt)
      .to({ rotation: -Math.PI / 100, y: y + 5 }, 2000, Phaser.Easing.Quadratic.InOut)
      .to({ rotation: Math.PI / 100, y: y - 5 }, 2000, Phaser.Easing.Quadratic.InOut)
      .loop()
      .start();
    */
	},

	update: function() {
		//	Do some nice funky main menu effect here
	},

	toMainMenu: function() {
		this.game.state.start('MainMenu');
	}
};
