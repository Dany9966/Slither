'use strict';

var canvas, gl;

function loadShaderAsync(shaderURL, callback) {
	var req = new XMLHttpRequest();
	req.open('GET', shaderURL, true);
	req.onload = function () {
		if (req.status < 200 || req.status >= 300) {
			callback('Could not load ' + shaderURL);
		} else {
			callback(null, req.responseText);
		}
	};
	req.send();
}

function addEvent(object, type, callback){
	if(object == null || typeof(object) == 'undefined') return; 
	if(object.addEventListener){
		object.addEventListener(type, callback, false);
	} else if(object.attachEvent){
		object.attachEvent("on" + type, callback);
	} else{
		object["on" + type] = callback;

	}
};

function removeEvent(object, type, callback){
	if(object == null || typeof(object) == 'undefined') return;
	if(object.removeEventListener){
		object.removeEventListener(type, callback, false);

	} else if(object.detachEvent){
		object.detachEvent("on" + type, callback);
	} else{
		object["on" + type] = callback;
	}
}

function Init(){
	async.map({
		vsText: '/mandle.vs.glsl',
		fsText: '/mandle.fs.glsl'
	}, loadShaderAsync, RunDemo);
};

function RunDemo(loadErrors, loadedShaders){
	//Attach callbacks
	// addEvent(window, 'resize', onResizeWindow);
	addEvent(window, 'wheel', onZoom);

	canvas = document.getElementById('gl-surface');
	gl = canvas.getContext('webgl');
	if(!gl){
		console.log('WebGL not supported, falling back to experimental');
		gl = canvas.getContext('webgl-experimental');
	}
	if(!gl){
		alert('WebGL not supported on this broswer');
		return;
	}
	// Create shader program

	var vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, loadedShaders[0]);
	gl.compileShader(vs);
	if(!gl.getShaderParameter(vs, gl.COMPILE_STATUS)){
		console.error('Vertex shader compile error', gl.getShaderInfoLog(vs));
	}

	var fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, loadedShaders[1]);
	gl.compileShader(fs);
	if(!gl.getShaderParameter(fs, gl.COMPILE_STATUS)){
		console.error('Fragment shader compile error', gl.getShaderInfoLog(fs));
	}

	var program = gl.createProgram();
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('shader program link error', gl.getProgramInfoLog(program));
	}
	gl.useProgram(program);

	// get uniform locations
	var uniforms = {
		viewportDimensions: gl.getUniformLocation(program, 'viewportDimensions'),
		minI: gl.getUniformLocation(program, 'minI'),
		maxI: gl.getUniformLocation(program, 'maxI'),
		minR: gl.getUniformLocation(program, 'minR'),
		maxR: gl.getUniformLocation(program, 'maxR')
	};

	// Set CPU-side variables for all of our variables
	var vpDimensions = [canvas.width, canvas.height];
	var minI = -2.0;
	var maxI = 2.0;
	var minR = -2.0;
	var maxR = 2.0;

	// Create buffers
	var vertexBuffer = gl.createBuffer();
	var vertices = [
		-1, 1,
		-1, -1,
		1, -1,

		-1, 1,
		1, 1,
		1, -1
	];
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	var vPosAttrib = gl.getAttribLocation(program, 'vPos');
	gl.vertexAttribPointer(
		vPosAttrib,
		2, gl.FLOAT,
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT,
		0
	);

	gl.enableVertexAttribArray(vPosAttrib);

	var thisFrameTime;
	var lastFrameTime = performance.now();
	var dt;
	var frames = [];
	var lastPrintTime = performance.now();

	var loop = function(){
		//	FPS information
		thisFrameTime = performance.now();
		dt = thisFrameTime - lastFrameTime;
		lastFrameTime = thisFrameTime;
		frames.push(dt);
		if(lastPrintTime + 750 < thisFrameTime) {
			lastPrintTime = thisFrameTime;
			var average = 0;
			for(var i = 0; i < frames.length; i++){
				average += frames[i];
			}
			average /= frames.length;
			document.title = 1000 / average + ' fps';
		}
		frames = frames.slice(0, 250);

		// Draw
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
		// console.log(uniforms);
		gl.uniform2fv(uniforms.viewportDimensions, vpDimensions);
		gl.uniform1f(uniforms.minI, minI);
		gl.uniform1f(uniforms.maxI, maxI);
		gl.uniform1f(uniforms.minR, minR);
		gl.uniform1f(uniforms.maxR, maxR);

		gl.drawArrays(gl.TRIANGLES, 0, 6);

		requestAnimationFrame(loop);
	};

	requestAnimationFrame(loop);

	function onResizeWindow(){
		if(!canvas){
			return;
		}

		// canvas.width = window.innerWidth;
		// canvas.height = window.innerHeight;
		// vpDimensions = [canvas.width, canvas.height];

		var oldRealRange = maxR - minR;
		maxR = (maxI - minI) * (canvas.height / canvas.width) * 1.4 + minR;
		var newRealRange = maxR - minR;

		minR -= (newRealRange - oldRealRange) / 2;
		maxR = (maxI - minI) * (canvas.height / canvas.width) * 1.4 + minR;

		gl.viewport(0, 0, canvas.width, canvas.height);
	};


	function onZoom(e){
		// console.log(e);
		var imaginrayRange = maxI - minI;
		var newRange;

		if(e.deltaY < 0){
			newRange = imaginrayRange * 0.95;
		} else{
			newRange = imaginrayRange * 1.05;
		}

		var delta = newRange - imaginrayRange;

		minI -= delta / 2;
		maxI = minI + newRange;

		onResizeWindow();
	};
};
