
BasicGame.Game = function (game) {
  this.LIVES = 3;

  this.colors = ["#7FDBFF", "#0074D9", "#001F3F", "#39CCCC", "#2ECC40", "#3D9970", "#01FF70", "#FFDC00", "#FF851B", "#FF4136", "#F012BE", "#B10DC9", "#85144B", "#dddddd", "#aaaaaa"];

  this.minCountDown = 5000;
  this.maxCountDown = 60000;

  this.minNextPatient = 1000;
  this.maxNextPatient = 5000;
};

BasicGame.Game.prototype = {
  create: function () {
    BasicGame.score = 0;
    this.patientsSpawned = 0;
    this.carDraggedByPointerId = [];

    // For browsers that support it, this keeps our pixel art looking crisp
    // This only works when you use Phaser.CANVAS as the renderer
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    this.game.onPause.add(function() {

    });

    this.blocks = this.add.group();
    this.appartmentBlocks = [];
    for (var y = 0; y < 2; y++) {
      for (var x = 0; x < 3; x++) {
        var block;
        if (BasicGame.level === 0 && y === 1 && x === 1) {
          block = this.blocks.create(198 + 314 * x, 228 + 314 * y + 40, 'block');
          block.scale.setTo(11, 6);
        } else if (BasicGame.level === 1 && y === 0 && x === 2) {
          block = this.blocks.create(198 + 314 * x, 228 + 314 * y - 40, 'block');
          block.scale.setTo(11, 6);
        } else if (BasicGame.level === 1 && y === 1 && x === 0) {
          block = this.blocks.create(198 + 314 * x - 40, 228 + 314 * y, 'block');
          block.scale.setTo(6, 11);
        } else {
          block = this.blocks.create(198 + 314 * x, 228 + 314 * y, 'block');
          block.scale.setTo(11, 11);
          this.appartmentBlocks.push(block);
        }
        block.anchor.setTo(0.5, 0.5);
        block.visible = true;
        //block.body.setSize(block.body.width - 20, block.body.height - 20, 10, 10); // x, y, offsetX, offsetY

        block.body.immovable = true;
      }
    }

    this.hospitals = this.add.group();
    if (BasicGame.level === 0) {
      var hospital = this.hospitals.create(this.world.centerX, this.world.centerY * 1.4, 'hospital');
      hospital.anchor.setTo(0.5, 0.5);
      hospital.scale.setTo(0.8, 0.8);
    } else {
      var hospital1 = this.hospitals.create(this.world.centerX * 0.45, this.world.centerY * 1.4, 'hospital');
      hospital1.anchor.setTo(0.5, 0.5);
      hospital1.scale.setTo(0.8, 0.8);

      var hospital2 = this.hospitals.create(this.world.centerX * 1.60, this.world.centerY * 0.68, 'hospital');
      hospital2.anchor.setTo(0.5, 0.5);
      hospital2.scale.setTo(0.8, 0.8);
    }

    this.map = this.add.sprite(this.world.centerX, this.world.centerY, (BasicGame.level === 0 ? 'map' : 'map2'));
    this.map.anchor.setTo(0.5, 0.5);

    this.patients = this.add.group();
    this.time.events.create(2000, false, 0, this.newPatient, this);

    this.cars = this.add.group();

    this.popupTexts = this.add.group();

    this.scoreText = this.add.text(this.world.centerX, 16, '0 patients rescued', { font: "bold 24px Verdana", fill: "#FFFFFF", stroke: "#FF4136", strokeThickness: 5 });
    this.scoreText.anchor.setTo(0.5, 0.5);

    this.liveIcons = this.add.group();
    for (var l = 0; l < this.LIVES; l++) {
      var lifeIcon = this.liveIcons.create(this.world.width - (100 + l * 50), 16, 'patient');
      lifeIcon.anchor.setTo(0.5, 0.5);
      lifeIcon.scale.setTo(0.8, 0.8);
      this.add.tween(lifeIcon)
        .to({ rotation: -Math.PI / 6 }, 2000, Phaser.Easing.Quadratic.InOut)
        .to({ rotation: Math.PI / 6 }, 2000, Phaser.Easing.Quadratic.InOut)
        .loop()
        .start();
    }

    this.addCar();

    this.overlay = this.add.sprite(this.world.centerX, this.world.centerY, 'red');
    this.overlay.anchor.setTo(0.5, 0.5);
    this.overlay.scale.setTo(100, 100);
    this.overlay.alpha = 0.0;

    this.time.events.start();
  },

  render: function() {
    var ctx = this.game.context;

    ctx.setLineDash([20,6]);
    var me = this;
    this.cars.forEach(function(car) {
      if (car.movePoints.length > 0) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        var lastIndex = car.movePoints.length - 1;
        ctx.moveTo(car.movePoints[lastIndex].x, car.movePoints[lastIndex].y);
        for (var i = lastIndex - 1; i >= 0; i--) {
          ctx.lineTo(car.movePoints[i].x, car.movePoints[i].y);
        }
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 4;
        ctx.strokeStyle = car.color;
        ctx.beginPath();
        ctx.moveTo(car.movePoints[lastIndex].x, car.movePoints[lastIndex].y);
        for (var j = lastIndex - 1; j >= 0; j--) {
          ctx.lineTo(car.movePoints[j].x, car.movePoints[j].y);
        }
        ctx.stroke();
        ctx.closePath();
      }
    });

    ctx.setLineDash([]);

    this.patients.forEach(function(patient) {
      var timePercentage = (patient.countDown / me.maxCountDown);

      // black stroke
      ctx.beginPath();
      ctx.arc(patient.center.x, patient.center.y, 35, -Math.PI / 2 - 0.03, 0.03 -Math.PI / 2 + (Math.PI * 2) * timePercentage, false);
      ctx.lineWidth = 9;
      ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.stroke();

      // arc
      ctx.beginPath();
      ctx.arc(patient.center.x, patient.center.y, 35, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) * timePercentage, false);
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgba(' + Math.round(255 - 200 * timePercentage) + ', ' + Math.round(200 * timePercentage) + ', 0, 1.0)';
      ctx.stroke();
    });

    // this.game.debug.renderPointer(this.input.mousePointer);
    // this.game.debug.renderPointer(this.input.pointer1);
    // this.game.debug.renderPointer(this.input.pointer2);
  },

  update: function () {
    for (var id in this.carDraggedByPointerId) {
      var pointer = (id === '0' ? this.input.mousePointer : this.input['pointer' + id]);
      if (!pointer || !pointer.active) continue;

      var draggedCar = this.carDraggedByPointerId[id];
      if (!draggedCar) continue;

      draggedCar.movePoints.push(pointer.position.clone());
    }

    var me = this;
    this.cars.forEach(function(car) {
      if (!car.driving) {
        car.body.velocity.x = 0;
        car.body.velocity.y = 0;
        return;
      }

      var nextPoint = car.movePoints[0];
      while (nextPoint) {
        if (nextPoint.distance(car.center) > 20) break;
        car.movePoints = car.movePoints.splice(1);
        nextPoint = car.movePoints[0];
      }

      if (nextPoint) {
        var SPEED = 250;
        me.physics.overlap(car, me.patients, me.carArrivedAtPatient, null, me);
        me.physics.overlap(car, me.hospitals, me.carArrivedAtHospital, null, me);
        me.physics.overlap(car, me.blocks, function(car, block) { SPEED = 50; }, null, me);

        me.physics.moveToXY(car, nextPoint.x, nextPoint.y, SPEED);
        car.rotation = me.physics.angleBetween(car, nextPoint) + Math.PI / 2;
      } else {
        car.body.velocity.x = 0;
        car.body.velocity.y = 0;
      }
    });

    if (this.liveIcons.countLiving() <= 0) {
      this.quitGame();
    }
  },

  addCar: function() {
    var randomHospital = this.hospitals.getRandom();
    var car = this.cars.create(randomHospital.x, randomHospital.y, 'car');
    car.anchor.setTo(0.5, 0.5);
    car.scale.setTo(0.8, 0.8);
    //car.body.setSize(car.body.width + 20, car.body.height + 20, -10, -10); // x, y, offsetX, offsetY
    car.inputEnabled = true;
    car.input.enableDrag(false, true);
    car.input.setDragLock(false, false);
    car.events.onDragStart.add(this.startDragCar, this);
    car.events.onDragStop.add(this.endDragCar, this);
    car.color = this.randomColor();
    car.dragging = false;
    car.movePoints = [];
    car.patients = [];

    this.popupText(car.x, car.y - 30, "Ambulance ready!", '#0074D9');
  },

  newPatient: function() {
    this.patientsSpawned++;
    var randomBlock = this.rnd.pick(this.appartmentBlocks);
    var distanceFromBlock = 25;
    var patientX = randomBlock.topLeft.x - distanceFromBlock;
    var patientY = randomBlock.topLeft.y - distanceFromBlock;
    var horizontally = this.rnd.pick([0,1]) < 0.5;
    if (horizontally) {
      patientX += this.rnd.realInRange(0, 1) * randomBlock.width;
      patientY += this.rnd.pick([0,1]) * (randomBlock.height + distanceFromBlock * 2);
    } else {
      patientX += this.rnd.pick([0,1]) * (randomBlock.width + distanceFromBlock * 2);
      patientY += this.rnd.realInRange(0, 1) * randomBlock.height;
    }

    var patient = this.patients.create(patientX, patientY, 'patient');
    patient.anchor.setTo(0.5, 0.5);
    patient.body.setSize(patient.body.width + 20, patient.body.height + 20, -10, -10); // x, y, offsetX, offsetY

    var minCountDown = Math.max(this.minCountDown, this.maxCountDown - this.patientsSpawned * 1000);
    patient.countDown = this.rnd.realInRange(minCountDown, this.maxCountDown);
    patient.countTween = this.add.tween(patient);
    patient.countTween.onComplete.add(this.patientDies, this);
    patient.countTween.to({ countDown: 0 }, patient.countDown, Phaser.Easing.Quadratic.Out, true);

    if (this.patients.length > 0)
      this.patients.sort('countDown', Phaser.Group.SORT_DESCENDING);

    this.add.tween(patient)
      .to({ rotation: -Math.PI / 6 }, 1000, Phaser.Easing.Quadratic.InOut)
      .to({ rotation: Math.PI / 6 }, 1000, Phaser.Easing.Quadratic.InOut)
      .loop()
      .start();

    var texts = ['Help!', '911!', 'Hurry!', 'Need assistance!', 'To the hospital!', 'Help me!', 'Send help!', 'I need help!'];
    this.popupText(patient.x, patient.y - 30, this.rnd.pick(texts), '#FF851B');

    if (this.patientsSpawned === 10 || this.patientsSpawned === 40 || this.patientsSpawned === 80) {
      this.addCar();
    }

    var timeToNextPatient = Math.max(this.minNextPatient, this.maxNextPatient - this.patientsSpawned * 50);
    this.time.events.create(timeToNextPatient, false, 0, this.newPatient, this);
  },

  quitGame: function() {
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
    this.tweens.removeAll();
    this.time.events.stop();
    this.blocks.destroy();
    this.hospitals.destroy();
    this.patients.destroy();
    this.cars.destroy();
    this.liveIcons.destroy();
    this.carDraggedByPointerId.length = 0;

    this.game.state.start('MainMenu');
  },

  popupText: function(x, y, text, color) {
    var t = this.popupTexts.add(this.add.text(x, y, text, { font: "bold 18px Verdana", fill: color, stroke: "#000000", strokeThickness: 5 }));
    t.anchor.setTo(0.5, 0.5);
    t.alpha = 0.0;

    this.add.tween(t)
      .to({ alpha: 1, y: y - 30 }, 800, Phaser.Easing.Elastic.Out)
      .to({ alpha: 0, y: y }, 800, Phaser.Easing.Cubic.InOut)
      .start();
      
    this.add.tween(t)
      .to({}, 1700)
      .start()
      .onComplete.add(function() { t.destroy(); });
  },

  carArrivedAtPatient: function(car, patient) {
    if (!patient.visible) return;
    car.patients.push(patient);
    patient.center = car.center;
    patient.visible = false;
  },

  carArrivedAtHospital: function(car, hospital) {
    var patientCount = car.patients.length;
    if (!patientCount) return;

    this.popupText(car.center.x, car.center.y, patientCount + ' patient' + (patientCount > 1 ? 's' : '') + ' rescued', '#2ECC40');
    BasicGame.score += patientCount;
    this.scoreText.content = BasicGame.score + ' patient' + (BasicGame.score > 1 ? 's' : '') + ' rescued';
    while (car.patients.length > 0) {
      var patient = car.patients[0];
      patient.countTween.stop();
      patient.destroy();
      car.patients.splice(0, 1);
    }
  },

  patientDies: function(patient) {
    this.popupText(patient.center.x, patient.center.y, 'A patient has died!', '#FF4136');
    this.cars.forEach(function(car) {
      for (var i = 0; i < car.patients.length; i++) {
        if (car.patients[i] == patient) {
          car.patients.splice(i, 1);
          return;
        }
      }
    });
    patient.destroy();

    this.add.tween(this.overlay)
      .to({ alpha: 0.9 }, 50, Phaser.Easing.Cubic.InOut)
      .to({ alpha: 0 }, 1000, Phaser.Easing.Cubic.InOut)
      .start();

    var lifeIcon = this.liveIcons.getFirstAlive();
    if (lifeIcon) {
      lifeIcon.destroy();
    }
  },

  randomColor: function() {
    return this.removeRandom(this.colors);
  },

  removeRandom: function(arr) {
    return arr.splice(this.rnd.integerInRange(0, arr.length), 1)[0];
  },

  startDragCar: function(car) {
    car.dragging = true;
    car.movePoints = [];
    car.driving = false;

    this.carDraggedByPointerId[this.input.activePointer.id] = car;
  },

  endDragCar: function(car) {
    car.dragging = false;
    car.driving = true;

    this.carDraggedByPointerId[this.input.activePointer.id] = null;
  }

};
