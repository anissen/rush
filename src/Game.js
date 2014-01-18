
BasicGame.Game = function (game) {
  this.CARS = 1;
  this.PATIENTS = 6;
  this.HOSPITALS = 1;

  this.maxTimeOut = 60000;

  this.score = 0;
  this.tileSize = 50;
  this.carDragged = null;

  this.patientTimer = null;
};

BasicGame.Game.prototype = {
  create: function () {
    this.world.setBounds(0, 0, this.game.width, this.game.height);

    // For browsers that support it, this keeps our pixel art looking crisp
    // This only works when you use Phaser.CANVAS as the renderer
    Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
    var map = this.add.sprite(this.world.centerX, this.world.centerY, 'map');
    map.anchor.setTo(0.5, 0.5);
    map.scale.setTo(50, 50);

    this.hospitals = this.add.group();
    for (var h = 0; h < this.HOSPITALS; h++) {
      var hospital = this.hospitals.create(this.world.centerX, this.world.centerY, 'hospital');
      hospital.anchor.setTo(0.5, 0.5);
      hospital.inputEnabled = true;
    }

    this.patients = this.add.group();
    this.patientTimer = this.time.events.loop(Phaser.Timer.SECOND * 5, this.newPatient, this);

    this.cars = this.add.group();
    for (var c = 0; c < this.CARS; c++) {
      var car = this.cars.create(this.world.randomX, this.world.randomY, 'car');
      car.anchor.setTo(0.5, 0.5);
      car.inputEnabled = true;
      car.events.onInputDown.add(this.selectCar, this);
      car.input.enableDrag(false, true);
      car.input.setDragLock(false, false);
      car.events.onDragStart.add(this.startDragCar, this);
      car.events.onDragStop.add(this.endDragCar, this);
      car.color = this.randomColor();
      car.dragging = false;
      car.movePoints = [];
    }

    this.blocks = this.add.group();
    for (var y = 0; y < 2; y++) {
      for (var x = 0; x < 2; x++) {
        var block = this.blocks.create(340 + 350 * x, 200 + 350 * y, 'block');
        block.anchor.setTo(0.5, 0.5);
        block.scale.setTo(11, 11);
        block.body.immovable = true;
      }
    }

    this.popupTexts = this.add.group();

    this.scoreText = this.add.text(16, 16, '0 patients saved', { font: "16pt Courier", fill: "#ee0000", stroke: "#ffffff", strokeThickness: 2 });
  },

  render: function() {
    var ctx = this.game.context;

    if (this.selected) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = this.selected.color;
      ctx.beginPath();
      ctx.arc(this.selected.center.x, this.selected.center.y, 30, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }

    this.cars.forEach(function(car) {
      if (car.movePoints.length > 0) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = car.color;
        ctx.beginPath();
        ctx.moveTo(car.movePoints[0].x, car.movePoints[0].y);
        for (var i = 1; i < car.movePoints.length; i++) {
          ctx.lineTo(car.movePoints[i].x, car.movePoints[i].y);
        }
        ctx.stroke();
        ctx.closePath();
      }

      if (!car.dest) return;
      ctx.lineWidth = 4;
      ctx.strokeStyle = car.color;
      ctx.beginPath();
      ctx.moveTo(car.center.x, car.center.y);
      ctx.lineTo(car.dest.center.x, car.dest.center.y);
      ctx.stroke();
      ctx.closePath();

      if (car.full) {
        ctx.beginPath();
        ctx.arc(car.center.x, car.center.y, 30, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fill();
      }
    });

    var me = this;
    this.patients.forEach(function(patient) {
      ctx.beginPath();
      var timePercentage = (patient.countDown / me.maxTimeOut);
      ctx.arc(patient.center.x, patient.center.y, 30, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2) * timePercentage, false); // 60000 is max count down for now
      ctx.lineWidth = 6;

      // from: 0, 255, 0
      // to: 255, 0, 0
      ctx.strokeStyle = 'rgb(' + Math.round(255 - 255 * timePercentage) + ', ' + Math.round(255 * timePercentage) + ', 0)';
      ctx.stroke();
    });
  },

  update: function () {
    if (this.carDragged) {
      this.carDragged.movePoints.push(this.input.position.clone());
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
        me.patients.forEach(function(patient) {
          if (car.center.distance(patient.center) < 50) {
            me.carArrivedAtPatient(car, patient);
          }
        });
        me.hospitals.forEach(function(hospital) {
          if (car.center.distance(hospital.center) < 50) {
            me.carArrivedAtHospital(car, hospital);
          }
        });
        if (nextPoint.distance(car.center) > 20) break;
        
        car.movePoints = car.movePoints.splice(1);
        nextPoint = car.movePoints[0];
      }

      if (nextPoint) {
        var SPEED = 100;
        me.physics.overlap(car, me.blocks, function(car, block) { SPEED = 30; }, null, me);

        // TODO: Handle collisions between patients and hospitals instead of using distance??        
        me.physics.moveToXY(car, nextPoint.x, nextPoint.y, SPEED);
        car.rotation = me.physics.angleBetween(car, nextPoint) + Math.PI / 2;
      } else {
        car.body.velocity.x = 0;
        car.body.velocity.y = 0;
      }
    });
  },

  newPatient: function() {
    var patient = this.patients.create(this.snapX(this.world.randomX), this.snapY(this.world.randomY), 'patient');
    patient.anchor.setTo(0.5, 0.5);
    patient.inputEnabled = true;

    patient.countDown = this.rnd.realInRange(this.maxTimeOut / 5, this.maxTimeOut);
    patient.countTween = this.add.tween(patient);
    patient.countTween.onComplete.add(this.patientDies, this);
    patient.countTween.to({ countDown: 0 }, patient.countDown, Phaser.Easing.Quadratic.Out, true);

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
    var t = this.popupTexts.add(this.add.text(x, y, text, { font: "20px Arial", fill: color, align: "center" }));
    t.anchor.setTo(0.5, 0.5);
    t.alpha = 0.0;

    this.add.tween(t)
      .to({ alpha: 1, y: y - 30 }, 800, Phaser.Easing.Elastic.Out)
      .to({ alpha: 0, y: y }, 800, Phaser.Easing.Cubic.InOut)
      .start();
      
    this.add.tween(t)
      .to({}, 1700)
      .start()
      .onComplete.add(function() { console.log('destroyed'); t.destroy(); });
  },

  selectCar: function(sprite) {
    this.selected = sprite;
  },

  patientForCarDied: function(patient, car) {
    car.moveTween.stop();
    car.full = false;
    car.patient = false;
    car.dest = null;
  },

  carArrivedAtPatient: function(car, patient) {
    car.full = true;
    car.patient = patient;
    patient.center = car.center;
    patient.visible = false;
  },

  carArrivedAtHospital: function(car, hospital) {
    if (car.full) {
      this.popupText(car.patient.center.x, car.patient.center.y, 'A patient was saved', 'green');
      this.score++;
      this.scoreText.content = this.score + ' patients saved';
      car.patient.countTween.stop();
      car.patient.destroy();

      this.add.tween(hospital)
        .to({ rotation: this.rnd.normal() * 3 }, 500, Phaser.Easing.Cubic.InOut)
        .to({ rotation: 0 }, 500, Phaser.Easing.Cubic.InOut)
        .start();
    }
    car.full = false;
  },

  patientDies: function(patient) {
    this.popupText(patient.center.x, patient.center.y, 'A patient has died!', 'red');
    patient.kill();
  },

  randomColor: function() {
    var me = this;
    var rndColorInt = function() { return me.rnd.integerInRange(0, 255); };
    return 'rgb(' + rndColorInt() + ',' + rndColorInt() + ',' + rndColorInt() + ')';
  },

  snapX: function(x) {
    return Math.floor(x / this.tileSize) * this.tileSize; //  + tileSize / 2
  },

  snapY: function(y) {
    return Math.floor(y / this.tileSize) * this.tileSize;
  },

  startDragCar: function(car) {
    car.dragging = true;
    car.movePoints = [];
    this.carDragged = car;
    car.driving = false;
  },

  endDragCar: function(car) {
    car.dragging = false;
    this.carDragged = null;
    car.driving = true;
  }

};
