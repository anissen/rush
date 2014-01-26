
BasicGame.MainMenu = function (game) {
	this.playButton = null;
};

BasicGame.MainMenu.prototype = {
	create: function () {
		this.add.sprite(0, 0, 'titlepage');
		this.playButton = this.add.button(400, 600, 'playButton', this.startGame, this, 'over', 'out', 'over');
	},

	update: function () {
		//	Do some nice funky main menu effect here
	},

	startGame: function (pointer) {
		this.game.state.start('Game');
	}
};
