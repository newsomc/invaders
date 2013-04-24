//file:///Users/hcnewsom/Sites/games/space_invaders/index.html
(function(){

   // Canvas elements
   var canvasWidth = 780, canvasHeight = 620,
   c = document.getElementById("space-invaders");
   var ctx = c.getContext("2d"),
   fps = 60,
   interval = 1000 / fps;

   var bullets = [];

   // Entities
   var user = {
     color : "#00A",
     x : 25,
     y : 125,
     width : 15,
     height : 5,
     midpoint : function(){
       return {
         x : this.x + this.width / 2,
         y : this.y + this.height / 2
       };
     },
     shoot : function(){
       var slugPosition = this.midpoint();
       bullets.push(Slug({
         speed : 5,
         x : slugPosition.x,
         y : slugPosition.y
       }));
     },
     draw : function(){
       ctx.fillStyle = this.color;
       ctx.fillRect(this.x, this.y, this.width, this.height);
     }
   };

   function Slug(bullet){
     bullet.active = true;
     bullet.xVelocity = 0;
     bullet.yVelocity = -bullet.speed;
     bullet.width = 3;
     bullet.height = 3;
     bullet.color = "#0000";
     
     bullet.inBounds = function(){
       return bullet.x >= 0 && bullet.x <= canvasWidth && 
         bullet.y >= 0 && bullet.y <= canvasHeight;
     };
     
     bullet.draw = function(){
       ctx.fillStyle = this.color;
       ctx.fillRect(this.x, this.y, this.width, this.height);
     };

     bullet.update = function(){
       bullet.x += bullet.xVelocity;
       bullet.y += bullet.yVelocity;
       bullet.active = bullet.active && bullet.inBounds();
     };

     return bullet;
   }

   // User input
   function handleKeys(){
     document.addEventListener("keydown", function(e){
       switch(e.keyCode){
         case 32:
           user.shoot();
         break;
         case 37:
           user.x -= 2;
         break;
         case 39:
           user.x += 2;
         break;
       }
     });
   }

   function update(){
     bullets.forEach(function(bullet){
       bullet.update();
     });

     bullets = bullets.filter(function(bullet){
       return bullet.active;
     });     
   }
   
   function animate(){
     ctx.clearRect(0, 0, canvasWidth, canvasHeight);
     user.draw();
     bullets.forEach(function(bullet){
       bullet.draw();               
     });
   }

   function draw() {
     setTimeout(function() {
       window.requestAnimationFrame(draw);
       update();
       animate();
     }, interval);
   };

   draw();
   handleKeys();

}());