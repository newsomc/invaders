//file:///Users/hcnewsom/Sites/games/space_invaders/index.html

/**
 * Bugs: 
 *  1. Cant move and shoot at the same time.
 */
(function(){

   var stats = new Stats();
   stats.setMode(0); // 0: fps, 1: ms
   stats.domElement.style.position = 'absolute';
   stats.domElement.style.left = '1215px';
   stats.domElement.style.top = '0px';
   document.body.appendChild( stats.domElement );

   //Globals...encapsulate in an APP class.
   var User = function(){
     this.color = "#00A";
     this.x = 25;
     this.y = game.canvasHeight - 100;
     this.velocityX = 0;
     this.speed = 2;
     this.width = 15;
     this.height = 5;
     this.maxSpeed = 10;
     this.friction = 0.93;
     this.score = 0;
     this.active = true;
     this.lives = 3;
     this.midpoint = {
       x : this.x + this.width / 2.5,
       y : this.y + this.height / 2
     };
   };

   User.prototype.shoot = function(){
     game.bullets.push(
       new Bullet({
         speed : 5,
         x : this.midpoint.x,
         y : this.midpoint.y
     }));
   };

   User.prototype.move = function(dir) {
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

   User.prototype.accelerate = function(friction, velocity) {
     this.velocityX *= friction;
     this.x += velocity;
   };

   User.prototype.event = function(a, e) {
     if (a == "shoot") {
       this.shoot();
       var aaa = 44444;
     }
     else {
       this.move(a);
     }
   };
   
   User.prototype.draw = function() {
     game.ctx.fillStyle = this.color;
     game.ctx.fillRect(this.x, this.y, this.width, this.height);
   };

   User.prototype.explode = function(x, y) {
     if(this.lives > 0){
       var particleAmt = Math.random() * 25 + 50;
       for (var i = 0; i < particleAmt; i++) {
         var dir   = Math.random()*2*Math.PI;
         var speed = Math.random()*3 + 2;
         var life  = Math.random()*10 + 10;
         particles[particles.length] = new Particle(x, y, speed, dir, life, this.color);
       }
     }
     else if(this.lives == 0){
       this.active = false;
       var particleAmt = Math.random() * 250 + 350;
       for (var i = 0; i < particleAmt; i++) {
         var dir   = Math.random() * 2 * Math.PI;
         var speed = Math.random() * 3 + 2;
         var life  = Math.random() * 10 + 10;
         particles[particles.length] = new Particle(x, y, speed, dir, life, this.color);
       }
     }
   };

   User.prototype.incrementScore = function() {
     this.score ++;
   };

   User.prototype.decrementLives = function() {
     this.lives --;
   };

   /**
    * Bullets.
    */
   var Bullet = function(bullet) {

     this.x = bullet.x;
     this.y = bullet.y;
     this.speed = bullet.speed;
     this.active = true;
     this.xVelocity = 0;
     this.yVelocity = -bullet.speed;
     this.width = 3;
     this.height = 3;
     this.color = "#3366FF";
   };

   Bullet.prototype.inBounds = function() {
     return this.x >= 0 && this.x <= this.canvasWidth && 
       this.y >= 0 && this.y <= this.canvasHeight;
   };
     
   Bullet.prototype.draw = function() {
     game.ctx.fillStyle = this.color;
     game.ctx.fillRect(this.x, this.y, this.width, this.height);
   };

   Bullet.prototype.update = function() {
     console.log(this.y, this.yVelocity);
     this.x += this.xVelocity;
     this.y += this.yVelocity;
     this.active = this.active && this.inBounds();
   };

   /**
    * Aliens
    */
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
     return this.x >= 0 && this.x <= game.canvasWidth && 
       this.y >= 0 && this.y <= game.canvasHeight;
   };
   
   Alien.prototype.draw = function() {
     if (this.alive) {
       game.ctx.fillStyle = this.color;
       game.ctx.fillRect(this.x, this.y, this.width, this.height);
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
   
   /**
    * Particles.
    */
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

   // Start global particle fncs.
   var drawParticles = function() {
     removeParticles();
     game.particles.forEach(function(p){
       game.ctx.fillStyle = p.color;
       game.ctx.fillRect(p.x-1, p.y-1, 1, 1); 
       p.update();
     });
   };

   var removeParticles = function() {
     for (var l = game.particles.length-1, i = l; i >= 0; i--) {
       if (game.particles[i].life < 0) {
         game.particles[i] = particles[particles.length-1];
         game.particles.length--;
       }
     }
   };

   var animateParticles = function() {
     var t;
     var h = 0.5, w = 0.5;
     if (t != null) {
       clearTimeout(t);       
     }
     game.ctx.clearRect(0, 0, w, h);
     drawParticles();
     t = setTimeout(animateParticles, 33);
   };

   var collision = function(a, b) {
     return a.x < b.x + b.width &&
       a.x + a.width > b.x &&
       a.y < b.y + b.height &&
       a.y + a.height > b.y;
   };

   var Game = function(){
     this.canvasWidth = 780; 
     this.canvasHeight = 620;
     this.c = document.getElementById("space-invaders");
     this.ctx = this.c.getContext("2d");
     this.fps = 60; 
     this.interval = 1000 / this.fps;
     this.bullets = [];
     this.aliens = [];
     this.particles = [];
     this.phase = "waiting";
	   this.keyHandlers = {
		   32: 'shoot',
		   37: 'moveLeft',
		   39: 'moveRight',
       83: 'start'
	   };
   };

   Game.prototype.handleCollisions = function(user) {
     this.bullets.forEach(function(bullet) {
       this.aliens.forEach(function(alien) {
         if(collision(bullet, alien)) {
           bullet.active = false;
           alien.explode(alien.x, alien.y);
           user.incrementScore();
         }
       });
     });
  
     this.aliens.forEach(function(alien) {
       if(collision(alien, user)) {
         user.explode(user.x, user.y);
         //This should handled in a different way...
         //user.decrementLives();
       }
     });
   };

   Game.prototype.update = function(user) {

     this.bullets.forEach(function(bullet){
       bullet.update();
     });

     this.bullets = this.bullets.filter(function(bullet){
       return bullet.active;
     });     

     user.accelerate(user.friction, user.velocityX);

     this.aliens.forEach(function(alien) {
       alien.update();
     });
     
     this.aliens = this.aliens.filter(function(alien) {
       return alien.alive;
     });
     
     if(Math.random() < 0.1) {
       this.aliens.push(new Alien);
     }

     this.handleCollisions(user);
   };
   
   Game.prototype.animate = function(user) {

     this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

     if(user.active){
       user.draw();              
     }

     this.bullets.forEach(function(bullet){
       bullet.draw();               
     });

     this.aliens.forEach(function(alien) {
       alien.draw();
     });
   };

   Game.prototype.updateScore = function(user) {
     this.user = user;
     this.ctx.lineWidth = 0.5;
     this.ctx.font="9px sans-serif";
     this.ctx.textAlign = "right";
     this.ctx.textBaseline = "bottom";
     this.ctx.fillText("Score: " + this.user.score, 300, 145);     
     this.ctx.fillText("Lives: " + this.user.lives, 300, 135);     
   };

   Game.prototype.gameDialog = function(msg) {
     this.ctx.lineWidth = 0.5;
     this.ctx.font="9px sans-serif";
     this.ctx.fillText(msg, 50, 135);     
   };

	 Game.prototype.handleKeys = function(user) {
     self = this;
		 document.addEventListener('keydown', function(e){
		   if( self.keyHandlers[e.keyCode] && user.active ) {
         user.event(self.keyHandlers[e.keyCode], e);         
       }
     });
	 };

   Game.prototype.main = function() {
     var user = new User();
     game.handleKeys(user);
     animateParticles();
     setTimeout(function(){
       stats.begin();
       window.requestAnimationFrame(game.main);
       game.animate(user);
       game.update(user);
       game.updateScore(user);
       stats.end();
     }, this.interval);
   };

   var game = new Game();
   game.main();

 }());
