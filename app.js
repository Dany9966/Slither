//vertex shader code variable
var vertexShaderText = 
[
	'precision mediump float;',
	'',
	'attribute vec3 vertPosition;',
	'attribute vec2 vertTexCoord;',
	'varying vec2 fragTexCoord;',
	'uniform mat4 mWorld;',
	'uniform mat4 mView;',
	'uniform mat4 mProj;',
	'',
	'void main()',
	'{',
	'	fragTexCoord = vertTexCoord;',
	'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
	'}'
].join('\n');

// fragment shader code variable
var fragmentShaderText = 
[
	'precision mediump float;',
	'',
	'varying vec2 fragTexCoord;',
	'uniform sampler2D sampler;',
	'',
	'void main()',
	'{',
	'	gl_FragColor = texture2D(sampler, fragTexCoord);',
	'}'
].join('\n');

var initDemo = function() {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');
	//if edge or safari browser
	if(!gl){
		console.log('WebGL not supported, failing back on experimental');
		gl = canvas.getContext('experimental-webgl');
	}
	//else not supported
	if(!gl){
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75,0.85,0.8,1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	//creating shaders
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	//assigning sources
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	//compiling shaders
	gl.compileShader(vertexShader);
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	//create program and attach + link shaders
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}

	//validate program
	gl.validateProgram(program);
	if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	//CREATE BUFFER
	/*var triangleVertices = 
	[ 	//X, Y, Z			R,G,B
		0.0, 0.5, 0.0,		1.0, 0.0, 0.0, 
		-0.5, -0.5,	0.0,	0.0, 1.0, 0.0,
		0.5, -0.5, 0.0,		0.0, 0.0, 1.0
	];*/

	var boxVertices = 
	[	//X, Y, Z			U, V
		//top face
		-1.0, 1.0, -1.0,	0, 0,
		-1.0, 1.0, 1.0,		0, 1,
		1.0, 1.0, 1.0, 		1, 1,
		1.0, 1.0, -1.0, 	1, 0,

		//left face
		-1.0, 1.0, 1.0, 	0, 0,
		-1.0, -1.0, 1.0,	1, 0,
		-1.0, -1.0, -1.0, 	1, 1,
		-1.0, 1.0, -1.0,	0, 1,

		// right face
		1.0, 1.0, 1.0, 		1, 1,
		1.0, -1.0, 1.0, 	0, 1,
		1.0, -1.0, -1.0, 	0, 0,
		1.0, 1.0, -1.0,		1, 0,

		// front face
		1.0, 1.0, 1.0,		1, 1,
		1.0, -1.0, 1.0, 	1, 0,
		-1.0, -1.0, 1.0, 	0, 0,
		-1.0, 1.0, 1.0,		0, 1,

		// back face
		1.0, 1.0, -1.0, 	0, 0,
		1.0, -1.0, -1.0, 	0, 1,
		-1.0, -1.0, -1.0, 	1, 1,
		-1.0, 1.0, -1.0, 	1, 0,

		// bottom face
		-1.0, -1.0, -1.0, 	1, 1,
		-1.0, -1.0, 1.0, 	1, 0,
		1.0, -1.0, 1.0, 	0, 0,
		1.0, -1.0, -1.0, 	0, 1

	];

	var boxIndices = 
	[
		// top
		0, 1, 2,
		0, 2, 3,

		//Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		//Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20 ,22,
		22, 20, 23
	];

	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
	var texAttributeLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		positionAttributeLocation, //Attribute location
		3, //Number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		//size of an individual vertex
		
		5 * Float32Array.BYTES_PER_ELEMENT,
		//offset from the beginning of a single vertex to this attribute
		0
	);

	gl.vertexAttribPointer(
		texAttributeLocation, //Attribute location
		2, //Number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		//size of an individual vertex
		
		5 * Float32Array.BYTES_PER_ELEMENT,
		//offset from the beginning of a single vertex to this attribute
		3 * Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.enableVertexAttribArray(texAttributeLocation);

	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('crate-image'));
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);

	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -10], [0,0,0], [0,1,0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, 	worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FASLE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//
	//main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function(){
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]); 
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		gl.activeTexture(gl.TEXTURE0);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
		requestAnimationFrame(loop);
			
	};

	requestAnimationFrame(loop);
	
};
