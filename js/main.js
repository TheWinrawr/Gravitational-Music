var canvas = $("#canvas")[0];
var context = canvas.getContext("2d");

var width = 1200;
var height = 800;
canvas.width = width;
canvas.height = height;

var g = 0.2; //gravitational constant, or "fudge factor"
var minRadius = 5;  //minimum radius of each node
var massRatio = 4;  //The larger this number, the more mass a node gains when its radius increases
var maxForce = 2.35;  //Maximum force allowed between two nodes
var frequencyToRadiusRatio = 5;  //The lower this number, the bigger a node becomes

var interval = 0;

var nodeList = [];

function init() {
	var colors = [];
	var colorOffset = Math.random() * numSamples/2;
	for(var i = 0; i < numSamples/2; i++)
		colors.push((i * 360/(numSamples/2)) + colorOffset);

	for(var i = 0; i < numSamples/2; i++) {
		var randomIndex = Math.floor(Math.random() * colors.length);
		var color = colors.splice(randomIndex, 1);

		nodeList[i] = new Node(Math.random()*width, Math.random()*height, color);
	}
}

function tick() {
	requestAnimationFrame(tick);
	//if(interval++ % 5 == 0) {
		draw();
	//}
	
}

function draw() {

	context.fillStyle = "rgba(210, 210, 210, 0.5)";
	context.fillRect(0, 0, width, height);

	var greatest = 0;

	/*Update radius and mass of each node based on audio data*/
	for(var i = 0; i < nodeList.length; i++) {
		nodeList[i].update(frequencyData[i]);
	}

	/*Update each node with new velocities*/
	for(var i = 0; i < nodeList.length; i++) {
		var node = nodeList[i];

		for(var j = i+1; j < nodeList.length; j++) {
			var other = nodeList[j];

			var direction = {x: other.x - node.x, y: other.y - node.y};
			var distance = node.getDistance(other);
			direction.x /= distance;
			direction.y /= distance;

			var force = g * (node.mass * other.mass) / (distance * distance);
			if(force > maxForce) force = maxForce;
			greatest = (force > greatest ? force : greatest);
			var forceVec = {x: force * direction.x, y: force * direction.y};

			//f = ma
			var nodeAccel = {x: forceVec.x / node.mass, y: forceVec.y / node.mass};
			var otherAccel = {x: -forceVec.x / other.mass, y: -forceVec.y / other.mass};

			node.vel.x += nodeAccel.x;
			node.vel.y += nodeAccel.y;
			other.vel.x += otherAccel.x;
			other.vel.y += otherAccel.y;

			if(force/maxForce > 0.03) node.drawEdge(other, force);
		}

		//update velocities
		node.x += node.vel.x;
		node.y += node.vel.y;

		if((node.x < 0 || node.x > width) && !node.outOfBounds) {
			node.outOfBounds = true;
			node.vel.x = -node.vel.x;
		}
		if((node.y < 0 || node.y > height) && !node.outOfBounds) {
			node.outOfBounds = true;
			node.vel.y = -node.vel.y;
		}

		if(node.x >= 0 && node.x <= width && node.y >= 0 && node.y <= height) {
			node.outOfBounds = false;
		}
		node.draw();
	}
	console.log(greatest);
}

function Node(x, y, color) {
	this.x = x;
	this.y = y;

	this.radius = minRadius;
	this.vel = {x: 0, y: 0};
	this.mass = this.radius * massRatio;

	this.hue = color;
	this.outOfBounds = false;

	this.draw = function() {
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		var sat = (this.radius - minRadius) * (100 / 15-minRadius);
		context.fillStyle = "hsla(" + this.hue + ", " + sat + "%, 50%, 0.5)";
		context.fill();
		context.closePath();
	}

	this.drawEdge = function(other, force) {
		var nodeSat = (this.radius - minRadius) * (100 / 10-minRadius);
		var otherSat = (other.radius - minRadius) * (100 / 10-minRadius);
		var alpha = (force/2);
		var nodeColor = "hsla(" + this.hue + ", " + nodeSat + "%, 50%, " + alpha + ")";
		var otherColor = "hsla(" + other.hue + ", " + otherSat + "%, 50%, " + alpha + ")";
		//var nodeColor = "rgba(0, 0, 0," + alpha + ")";
		//var otherColor = "rgba(0, 0, 0," + alpha + ")";

		var grad = context.createLinearGradient(this.x, this.y, other.x, other.y);
		grad.addColorStop(0, nodeColor);
		grad.addColorStop(1, otherColor);

		context.strokeStyle = grad;
		context.beginPath();
		context.moveTo(this.x, this.y);
		context.lineTo(other.x, other.y);
		context.lineWidth = 2;
		context.stroke();

	}

	/*Get the distance between two nodes*/
	this.getDistance = function(other) {
		return Math.sqrt( ((this.x-other.x)*(this.x-other.x)) + ((this.y-other.y)*(this.y-other.y)) );
	}

	this.update = function(frequency) {
		if(!frequency) return;

		var newRadius = frequency/frequencyToRadiusRatio;
		this.radius = newRadius > minRadius ? newRadius : minRadius;
		this.mass = this.radius * massRatio;
	}
}

init();
tick();