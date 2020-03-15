var mx = 0;
var mz = 0;
var jmp = 0;
var mcw = 0;
var mccw = 0;
var key_a = 0;
var key_d = 0;
var key_w = 0;
var key_s = 0;
var spd = 1;
var camera_offsetx = 0;
var camera_offsety = 3;
var offsetz_base = 12;
var camera_offsetz = offsetz_base;
var rot_angle = 0;
var counter = 0;
var top_num = 200;

/*
The next 4 functions are used to create objects with
defined meshes.
Hazard bounces the player when they touch it.
*/
function Player(sizex, sizey, sizez, camera, color){
	this.x = 3;
	this.y = 3;
	this.z = 0;
	this.grav = 0;
	this.sizex = sizex;
	this.sizey = sizey;
	this.sizez = sizez;
	this.geometry = new THREE.BoxGeometry(sizex,sizey,sizez);
	this.material = new THREE.MeshNormalMaterial({});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.camera = camera
	this.gravity = function(){
		if (jmp > 0){
			this.y += jmp/2;
			jmp -= .2;
			this.grav = 0;
		}
		else if (this.y <= 0){
			this.y = 0;
			this.grav = 0;
		}else{
			this.y -= this.grav;
			this.grav += .005;
		}
		this.mesh.position.y = this.y;
		this.camera.position.y = this.y + camera_offsety;
	}
}
function Item(x, y, z, sizex, sizey, sizez, color){
	this.x = x;
	this.y = y;
	this.z = z;
	this.sizex = sizex;
	this.sizey = sizey;
	this.sizez = sizez;
	this.geometry = new THREE.BoxGeometry(sizex,sizey,sizez);
	this.material = new THREE.MeshNormalMaterial({});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.x = x;
	this.mesh.position.y = y;
	this.mesh.position.z = z;
}
function Block(x, y, sizex, sizey, sizez, color){
	this.x = x;
	this.y = y;
	this.sizex = sizex;
	this.sizey = sizey;
	this.sizez = sizez;
	this.geometry = new THREE.BoxGeometry(sizex,sizey,sizez);
	this.material = new THREE.MeshNormalMaterial({});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.x = x;
	this.mesh.position.y = y;
}
function Hazard(x, y, z, sizex, sizey, sizez, bounce, color){
	this.x = x;
	this.y = y;
	this.z = z;
	this.sizex = sizex;
	this.sizey = sizey;
	this.sizez = sizez;
	this.geometry = new THREE.BoxGeometry(sizex,sizey,sizez);
	this.material = new THREE.MeshNormalMaterial({});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position.x = x;
	this.mesh.position.y = y;
	this.mesh.position.z = z;
	this.bounce = bounce;
	this.mobile = true;
	this.check_collision = function(play){
		var veca = new THREE.Vector3(this.x, this.y, this.z);
		var vecb = new THREE.Vector3(play.x, play.y, play.z);
		return (veca.distanceTo(vecb) < Math.min(this.sizex, this.sizey, this.sizez))
	}
}

var hazards = [];

window.onload = function(){
	// Create the scene, camera and renderer.
	width = window.innerWidth * .9;
	height = window.innerHeight * .9;
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(60, 
		width/height, 0.1, 1000);
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);
	
	var player = new Player(1, 1, 1, camera, 0x99FF99);
	var box = new Item(0, 0, 0, 1, 1, 1, 0xFF4444);
	var ground = new Block(0, -1, 15, 1, 5, 0xFFFFFF);

	// Create 50 platforms for the player to bounce off.
	for(var i = 0; i<50; i++){
		hazards.push(new Hazard(2 + i*8, i, 5, 2, 1, 2, 2.4, 0x444444))
		hazards.push(new Hazard(6 + i*8, i, 9, 2, 1, 2, 2.4, 0x444444))
		let item = new Item(4+ i*8, -.5, 7, .5, .5, .5, 0xFF4444)
		scene.add(item.mesh);
	}

	// At the end of the 50 platforms is a big extra bouncy cube
	hazards.push(new Hazard(0 + 50*8, 50, 2, 4, 4, 4, 5, 0x444444));

	player.mesh.position.x = player.x;

	// Add meshes to scene
	scene.add(player.mesh);
	scene.add(box.mesh);
	scene.add(ground.mesh);
	hazards.forEach(element => {
		element.mobile = false
		scene.add(element.mesh);
	});
	
	addEventListener("keydown", keyDown);
	addEventListener("keyup", keyUp);

	camera.position.z = 10;
	camera.position.x = player.x;
	camera.position.y = player.y + camera_offsety;
	camera.rotation.x = -.25;

	var animate = function(){
		requestAnimationFrame(animate);
		box.mesh.rotation.x += 0.01;
		box.mesh.rotation.y += 0.01;

		// Controls player movement and gravity:
		if (key_a == 1)
			mx = -1;
		else if (key_d == 1)
			mx = 1;
		else
			mx = 0;

		if (key_w == 1)
			mz = -1;
		else if (key_s == 1)
			mz = 1;
		else
			mz = 0;

		player.gravity();
		if (mx != 0 || mz != 0){
			if (mx != 0 && mz != 0){
				player.x += (mx * spd) * .07;
				player.z += (mz * spd) * .07;
			}else{
				player.x += (mx * spd) * .1;
				player.z += (mz * spd) * .1;
			}
			player.mesh.position.x = player.x;
			player.mesh.position.y = player.y;
			player.mesh.position.z = player.z;
			camera.position.x = player.x + camera_offsetx;
			camera.position.y = player.y + camera_offsety;
			camera.position.z = player.z + camera_offsetz;
		}
		if (mcw != 0 || mccw !=0){
			rot_angle -= (mcw - mccw)/100;
			if (rot_angle > .3)
				rot_angle = .3;
			if (rot_angle < -.3)
				rot_angle = -.3;
			camera.rotation.y = rot_angle;
			camera_offsetx = rot_angle*10;
			camera_offsetz = offsetz_base - Math.abs(rot_angle*5);

			camera.position.x = player.x + camera_offsetx;
			camera.position.z = player.z + camera_offsetz;
		}

		// Move hazards if they can move and check collisions with player.
		hazards.forEach(element => {
			if (element.mobile == true){
				element.x += .05;
				if (element.x > ground.sizex/2)
					element.x = -ground.sizex/2;
				element.mesh.position.x = element.x;
			}
			if (element.check_collision(player)){
				jmp = element.bounce;
			}
		});
		counter += 1;

		// Create mobile hazards at random intervals
		if (counter > top_num){
			let new_hazard = new Hazard(-ground.sizex/2, Math.random()*2, (Math.random()*4)-2, 1, 1, 1, 3, 0x444444)
			hazards.push(new_hazard);
			scene.add(new_hazard.mesh);
			counter = 0;
			top_num = 150 + (Math.random() * 300);
		}

		renderer.render(scene, camera);
	};
	animate();
}

var keyDown = function(e){
	if (e.key == "a"){
		key_a = 1;
	}
	if (e.key == "d"){
		key_d = 1;
	}
	if (e.key == "w"){
		key_w = 1;
	}
	if (e.key == "s"){
		key_s = 1;
	}
	if (e.key == " "){
		jmp = 1.5;
	}
	if (e.key == "q"){
		mcw = 1;
	}
	if (e.key == "e"){
		mccw = 1;
	}
	if (!isNaN(e.key) && e.key != " "){
		spd = parseInt(e.key);
	}
}

var keyUp = function(e){
	if (e.key == "a"){
		key_a = 0;
	}
	if (e.key == "d"){
		key_d = 0;
	}
	if (e.key == "w"){
		key_w = 0;
	}
	if (e.key == "s"){
		key_s = 0;
	}
	if (e.key == "q"){
		mcw = 0;
	}
	if (e.key == "e"){
		mccw = 0;
	}
	if (e.key == "i"){
		console.log(hazards.length);
	}
}