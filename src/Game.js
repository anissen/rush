
BasicGame.Game = function (game) {
  this.CARS = 2;
  this.PATIENTS = 6;
  this.HOSPITALS = 1;
  this.colors = ["#7FDBFF", "#0074D9", "#001F3F", "#39CCCC", "#2ECC40", "#3D9970", "#01FF70", "#FFDC00", "#FF851B", "#FF4136", "#F012BE", "#B10DC9", "#85144B", "#dddddd", "#aaaaaa"];

  this.maxTimeOut = 60000;

  this.score = 0;
  this.tileSize = 50;

  this.carDraggedByPointerId = [];

  this.patientTimer = null;
  this.patientsDied = 0;
  this.maxDeadPatients = 10;
};

BasicGame.Game.prototype = {
  create: function () {
    //this.world.setBounds(0, 0, this.game.width, this.game.height);

    // For browsers that support it, this keeps our pixel art looking crisp
    // This only works when you use Phaser.CANVAS as the renderer
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);

    this.game.onPause.add(function() {
      console.log('game paused');
    });

    this.blocks = this.add.group();
    for (var y = 0; y < 2; y++) {
      for (var x = 0; x < 3; x++) {
        var block;
        if (y === 1 && x === 1) {
          block = this.blocks.create(195 + 315 * x, 225 + 315 * y + 40, 'block');
          block.scale.setTo(12, 7);
        } else {
          block = this.blocks.create(195 + 315 * x, 225 + 315 * y, 'block');
          block.scale.setTo(12, 12);
        }
        block.anchor.setTo(0.5, 0.5);
        block.visible = true;
        block.body.immovable = true;
      }
    }
  
    var map = this.add.sprite(this.world.centerX, this.world.centerY, 'map');
    map.anchor.setTo(0.5, 0.5);

    this.hospitals = this.add.group();
    for (var h = 0; h < this.HOSPITALS; h++) {
      var hospital = this.hospitals.create(this.world.centerX, this.world.centerY * 1.4, 'hospital');
      hospital.anchor.setTo(0.5, 0.5);
      hospital.scale.setTo(0.8, 0.8);
      hospital.visible = false;
      hospital.inputEnabled = true;
    }

    this.patients = this.add.group();
    this.patientTimer = this.time.events.loop(Phaser.Timer.SECOND * 3, this.newPatient, this);

    this.cars = this.add.group();
    for (var c = 0; c < this.CARS; c++) {
      var car = this.cars.create(this.world.centerX, this.world.centerY, 'car');
      car.anchor.setTo(0.5, 0.5);
      car.scale.setTo(0.8, 0.8);
      car.inputEnabled = true;
      car.input.enableDrag(false, true);
      car.input.setDragLock(false, false);
      car.events.onDragStart.add(this.startDragCar, this);
      car.events.onDragStop.add(this.endDragCar, this);
      car.color = this.randomColor();
      car.dragging = false;
      car.movePoints = [];
      car.patients = [];
    }

    this.popupTexts = this.add.group();

    this.scoreText = this.add.text(this.world.centerX, 16, '0 patients saved', { font: "bold 24px Verdana", fill: "#FFFFFF", stroke: "#FF4136", strokeThickness: 5 });
    this.scoreText.anchor.setTo(0.5, 0.5);

    // var me = this;
    // var imageObj = new Image();
    // imageObj.onload = function() {
    //   me.pattern = me.game.context.createPattern(imageObj, 'repeat');
    // };
    // imageObj.src = 'http://www.html5canvastutorials.com/demos/assets/wood-pattern.png';
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
        for (var i = lastIndex - 1; i >= 0; i--) {
          ctx.lineTo(car.movePoints[i].x, car.movePoints[i].y);
        }
        ctx.stroke();
        ctx.closePath();
      }
    });

    ctx.setLineDash([]);

    this.patients.forEach(function(patient) {
      var timePercentage = (patient.countDown / me.maxTimeOut);

      // black stroke
      ctx.beginPath();
      ctx.arc(patient.center.x, patient.center.y, 35, -Math.PI / 2 - 0.03, 0.03 -Math.PI / 2 + (Math.PI * 2) * timePercentage, false);
      ctx.lineWidth = 9;
      ctx.strokeStyle = 'black';
      ctx.stroke();

      // arc
      ctx.beginPath();
      ctx.arc(patient.center.x, patient.center.y, 35, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) * timePercentage, false);
      ctx.lineWidth = 7;
      ctx.strokeStyle = 'rgb(' + Math.round(255 - 200 * timePercentage) + ', ' + Math.round(200 * timePercentage) + ', 0)';
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
        me.physics.overlap(car, me.blocks, function(car, block) { SPEED = 100; }, null, me);

        me.physics.moveToXY(car, nextPoint.x, nextPoint.y, SPEED);
        car.rotation = me.physics.angleBetween(car, nextPoint) + Math.PI / 2;
      } else {
        car.body.velocity.x = 0;
        car.body.velocity.y = 0;
      }
    });

    if (this.patientsDied >= this.maxDeadPatients) {
      this.game.state.start('MainMenu');
    }
  },

  newPatient: function() {
    var randomBlock = this.blocks.getRandom();
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
    patient.inputEnabled = true;

    patient.countDown = this.rnd.realInRange(this.maxTimeOut / 5, this.maxTimeOut);
    patient.countTween = this.add.tween(patient);
    patient.countTween.onComplete.add(this.patientDies, this);
    patient.countTween.to({ countDown: 0 }, patient.countDown, Phaser.Easing.Quadratic.Out, true);

    this.patients.sort('countDown', Phaser.Group.SORT_DESCENDING);

    this.add.tween(patient)
      .to({ rotation: -Math.PI / 6 }, 1000, Phaser.Easing.Quadratic.InOut)
      .to({ rotation: Math.PI / 6 }, 1000, Phaser.Easing.Quadratic.InOut)
      .loop()
      .start();
  },

  quitGame: function (pointer) {
    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
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

    this.popupText(car.center.x, car.center.y, patientCount + ' patient' + (patientCount > 1 ? 's' : '') + ' was saved', '#2ECC40');
    this.score += patientCount;
    this.scoreText.content = this.score + ' patient' + (patientCount > 1 ? 's' : '') + ' saved';
    while (car.patients.length > 0) {
      var patient = car.patients[0];
      patient.countTween.stop();
      patient.destroy();
      car.patients.splice(0, 1);
    }

    this.add.tween(hospital)
      .to({ rotation: this.rnd.normal() * 3 }, 500, Phaser.Easing.Cubic.InOut)
      .to({ rotation: 0 }, 500, Phaser.Easing.Cubic.InOut)
      .start();
  },

  patientDies: function(patient) {
    this.patientsDied++;
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
  },

  randomColor: function() {
    //var colorIndex = this.rnd.integerInRange(0, this.colors.length);
    console.log(this.colors.length);
    var color = this.removeRandom(this.colors); //this.colors.splice(colorIndex, 1)[0];
    console.log(this.colors.length, color);
    return color;
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
