//file:///Users/hcnewsom/Sites/games/space_invaders/index.html

/**
 * Bugs: 
 *  1. Cant move and shoot at the same time.
 *  2. User explosions are green.
 */
(function(){

   var User = function(){
     this.color = "#00A";
     this.x = 25;
     this.y = canvasHeight - 35;
     this.velocityX = 0;
     this.speed = 2;
     this.width = 15;
     this.height = 5;
     this.maxSpeed = 10;
     this.friction = 0.93;
     this.score = 0;
     this.lives = 3;
   };

   User.prototype.shoot = function(){
     this.midpoint = {
         x : this.x + this.width / 2.5,
         y : this.y + this.height / 2
       };
     bullets.push(
       new Bullet({
         speed : 5,
         x : this.midpoint.x,
         y : this.midpoint.y
       }));
   };

   User.prototype.move = function (dir) {
     this.dir = dir;
     if (this.dir === "moveLeft") {
       if (this.velocityX > -this.speed) {
         this.velocityX--;
       }
     } 
     else {
       this.velocityX++;         
     }
   };

   User.prototype.event = function(a, e) {
     switch(a){
       case "shoot":
         playSound(sounds["shoot"]);
         this.shoot();
       break;  
       case "moveLeft":
         this.move(a);
       break;
       case "moveRight":
         this.move(a);
       case "pause":
         pause();
       case "start":
         start();
       break;
     }
   };
   
   User.prototype.draw = function() {
     ctx.fillStyle = this.color;
     ctx.fillRect(this.x, this.y, this.width, this.height);
   };

   User.prototype.animate = function(friction, velocity) {
     this.velocityX *= friction;
     this.x += velocity;
   };

   User.prototype.explode = function() {
     if (this.lives > 0) {
       var particleAmt = Math.random() * 25 + 50;
       for (var i = 0; i < particleAmt; i++) {
         var dir   = Math.random()*2*Math.PI;
         var speed = Math.random()*3 + 2;
         var life  = Math.random()*10 + 10;
         particles[particles.length] = new Particle(this.x, this.y, speed, dir, life, "#00A");
       }
     }
     else if (this.lives == 0) {
       this.active = false;
       var particleAmt = Math.random() * 250 + 350;
       for (var i = 0; i < particleAmt; i++) {
         var dir   = Math.random() * 2 * Math.PI;
         var speed = Math.random() * 3 + 2;
         var life  = Math.random() * 10 + 10;
         particles[particles.length] = new Particle(this.x, this.y, speed, dir, life, "#00A");
       }
     }
   };

   User.prototype.incrementScore = function() {
     this.score ++;
   };

   User.prototype.decrementLives = function() {
     this.lives --;
   };

   var Bullet = function (bullet) {
     bullet.active = true;
     bullet.xVelocity = 0;
     bullet.yVelocity = -bullet.speed;
     bullet.width = 3;
     bullet.height = 3;
     bullet.color = "#3366FF";
     
     bullet.inBounds = function() {
       return bullet.x >= 0 && bullet.x <= canvasWidth && 
         bullet.y >= 0 && bullet.y <= canvasHeight;
     };
     
     bullet.draw = function() {
       ctx.fillStyle = this.color;
       ctx.fillRect(this.x, this.y, this.width, this.height);
     };

     bullet.update = function() {
       bullet.x += bullet.xVelocity;
       bullet.y += bullet.yVelocity;
       bullet.active = bullet.active && bullet.inBounds();
     };

     return bullet;
   };

   var Alien = function(alien) {
     alien = this;
     alien.alive = true;
     alien.age = Math.floor(Math.random() * 120);
     alien.color = "#00FF00";
     alien.x = 214 / 4 + Math.random() + 214 / 2;
     alien.y = 0;
     alien.velocityX = 0;
     alien.velocityY = 2;
     alien.width = 7;
     alien.height = 3;
   };

   Alien.prototype.inBounds = function() {
     return this.x >= 0 && this.x <= canvasWidth && 
       this.y >= 0 && this.y <= canvasHeight;
   };
   
   Alien.prototype.draw = function() {
     if (this.alive) {
       ctx.fillStyle = this.color;
       ctx.fillRect(this.x, this.y, this.width, this.height);
     }
   };
   
   Alien.prototype.update = function() {
     this.x += this.velocityX;
     this.y += this.velocityY;
     this.velocityX = 3 * Math.cos(this.age * Math.PI / 64);
     this.age++;
     this.alive = this.alive && this.inBounds();
   };
   
   Alien.prototype.explode = function(x, y) {
     var particleAmt = Math.random()*20 + 50;
     this.alive = false;
     for (var i = 0; i < particleAmt; i++) {
       var dir = Math.random()*2*Math.PI;
       var speed = Math.random()*3 + 2;
       var life = Math.random()*10 + 10;
       particles[particles.length] = new Particle(x, y, speed, dir, life, alien.color);
     }
   };

   var Particle = function(x, y, speed, dir, life, color) {
     this.x = x;
     this.y = y;
     this.life = life;     
     this.color = color;
     this._incX = Math.cos(dir) * speed;
     this._incY = Math.sin(dir) * speed;
   };
   
   Particle.prototype.update = function() {
     this.x += this._incX;
     this.y += this._incY;
     this.life--;
   };
     
   var drawExplosion = function() {
     removeParticles();
     particles.forEach(function(p){
       ctx.fillRect(p.x-1, p.y-1, 1, 1); 
       p.update();
     });
   };

   var removeParticles = function() {
     for(var l = particles.length-1, i = l; i >= 0; i--) {
       if(particles[i].life < 0) {
         particles[i] = particles[particles.length-1];
         particles.length--;
       }
     }
   };

   var animateParticles = function() {
     var t;
     var h = 0.5, w = 0.5;
     if(t != null){
       clearTimeout(t);       
     }
     ctx.clearRect(0, 0, w, h);
     drawExplosion();
     t = setTimeout(animateParticles, 33);
   };

   //Collisions.
   var collision = function(a, b) {
     return a.x < b.x + b.width &&
       a.x + a.width > b.x &&
       a.y < b.y + b.height &&
       a.y + a.height > b.y;
   };

   var handleCollisions = function() {
     bullets.forEach(function(bullet) {
       aliens.forEach(function(alien) {
         if(collision(bullet, alien)) {
           bullet.active = false;
           playSound(sounds["crash"]);
           alien.explode(alien.x, alien.y);
           user.incrementScore();
         }
       });
     });

     aliens.forEach(function(alien){
       if(collision(alien, user)){
         //alien.explode();
         user.explode();
         user.decrementLives();
       }
     });
   };

   var update = function() {
     bullets.forEach(function(bullet){
       bullet.update();
     });

     bullets = bullets.filter(function(bullet){
       return bullet.active;
     });     

     user.animate(user.friction, user.velocityX);

     aliens.forEach(function(alien) {
       alien.update();
     });
     
     aliens = aliens.filter(function(alien) {
       return alien.alive;
     });
     
     if(Math.random() < 0.1) {
       aliens.push(new Alien());
     }

     handleCollisions();
   };
   
   var animate = function() {
     ctx.clearRect(0, 0, canvasWidth, canvasHeight);
     user.draw();
     bullets.forEach(function(bullet){
       bullet.draw();               
     });

     aliens.forEach(function(alien) {
       alien.draw();
     });
   };


   var canvasWidth = 780, canvasHeight = 620,
   c = document.getElementById("space-invaders"),
   ctx = c.getContext("2d"), fps = 60, 
   interval = 1000 / fps, bullets = [], 
   aliens = [], particles = [], mute = false, tick = 0,
   phase= "waiting";

   //Stats.js
   var stats = new Stats();
   stats.setMode(0); 
   stats.domElement.style.position = 'absolute';
   stats.domElement.style.left = '390px';
   stats.domElement.style.top = '9px';
   document.body.appendChild( stats.domElement );

   var scoreDialog = function() {
     ctx.lineWidth = 0.5;
     ctx.font = "9px sans-serif";
     ctx.textAlign = "right";
     ctx.textBaseline = "bottom";
     ctx.fillText("Score: " + user.score, 340, canvasHeight - 45);     
     ctx.fillText("Lives: " + user.lives, 340, canvasHeight - 35);     
   };

   var gameDialog = function(msg) {
     ctx.lineWidth = 0.5;
     ctx.fillStyle = "#00FF00";
     ctx.font = "8px sans-serif";
     ctx.fillText(msg, 120, 100);     
   };

	 var keyHandlers = {
		 32 : 'shoot',
		 37 : 'moveLeft',
		 39 : 'moveRight',
     80 : 'pause',
     83 : 'start'  
	 };

   // Key handlers
	 function handleKeys(){
		 document.addEventListener('keydown', function(e) {
		   if( keyHandlers[e.keyCode] ) {
         user.event(keyHandlers[e.keyCode], e);         
       }
     });
	 }

   var sounds = {
    shoot : new Audio(["sounds/Laser_Shoot2.wav"]),
    crash : new Audio(["sounds/Explosion.wav"]),
    die   : new Audio(["sounds/Hit_Hurt2.wav"])
   };

   var playSound = function(sound){
     if (!mute) {
      if (sound.ended) {
        sound.play();
      } 
       else {
        sound.currentTime = 0;
        sound.play();
      }
    }
   };

   var mainDraw = function() {
     switch(phase){
       case "playing":
         tick++;           
         update();
         animate();
         scoreDialog();
       case "waiting":
         start();
       break;
       case "pause":
         pause();
       break;
     }
   };

   var mainLoop = function() {
     setTimeout(function() {
       stats.begin();
       window.requestAnimationFrame(mainLoop);
       mainDraw();
       stats.end();
     }, interval);
   };

   var pause = function(){
     phase = "pause";
   };

   var init = function(){
     handleKeys();
     mainLoop();
   };

   var start = function() {
     phase = "playing";
   };  

   var alien = new Alien;
   var user = new User;
   init();
   animateParticles();
}());
