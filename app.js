var gl;
var model;


var InitDemo = function(){
	loadTextResource('./shader.vs.glsl', function(vsErr, vsText){
		if(vsErr){
			alert('Fatal error getting vertex shader (see console)');
			console.error(vsErr);
		}else{
			loadTextResource('./shader.fs.glsl', function(fsErr, fsText){
				if(fsErr){
					alert('Fatal error getting frag shader (see console)');
					console.error(fsErr);
				} else {
					loadJSONResource('./Susan.json', function(modelErr, modelObj){
						
						if(modelErr){
							alert('Fatal error getting Susan model (see console)');
							//alert(modelErr);
							console.error(modelErr);
						}
						else{
							loadImage('/SusanTexture.png', function(imgErr, img){
								if(imgErr){
									alert('Fatal error loading texture (see console)');
									console.error(imgErr);
								}
								else{
									RunDemo(vsText, fsText, img, modelObj);		
								}
							});
							
						}
					});
					
				}
			});
		}
	});
};


var RunDemo = function(vertexShaderText, fragmentShaderText, SusanImage, SusanModel) {
	console.log('This is working');

	var canvas = document.getElementById('game-surface');
	gl = canvas.getContext('webgl');
	model = SusanModel;
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

	var susanVertices = SusanModel.meshes[0].vertices;

	var susanIndices = [].concat.apply([], SusanModel.meshes[0].faces);
	var susanTexCoords = SusanModel.meshes[0].texturecoords[0];
	var susanNormals = SusanModel.meshes[0].normals;

	var susanPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanVertices), gl.STATIC_DRAW);

	var susanTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanTexCoords), gl.STATIC_DRAW);

	var susanIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, susanIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(susanIndices), gl.STATIC_DRAW);

	var susanNormalBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(susanNormals), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanPosVertexBufferObject);
	var positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');	
	gl.vertexAttribPointer(
		positionAttributeLocation, //Attribute location
		3, //Number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		//size of an individual vertex
		
		3 * Float32Array.BYTES_PER_ELEMENT,
		//offset from the beginning of a single vertex to this attribute
		0
	);

	gl.enableVertexAttribArray(positionAttributeLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanTexCoordVertexBufferObject);
	var texAttributeLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texAttributeLocation, //Attribute location
		2, //Number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		//size of an individual vertex
		
		2 * Float32Array.BYTES_PER_ELEMENT,
		//offset from the beginning of a single vertex to this attribute
		0
	);

	gl.enableVertexAttribArray(texAttributeLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, susanNormalBufferObject);
	var normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
	gl.vertexAttribPointer(
		normalAttribLocation,
		3, gl.FLOAT,
		gl.TRUE,
		3 * Float32Array.BYTES_PER_ELEMENT,
		0
	);

	gl.enableVertexAttribArray(normalAttribLocation);

	var susanTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, susanTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, SusanImage);
	gl.bindTexture(gl.TEXTURE_2D, null);

	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);

	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, -10, 2], [0,0,0], [0,1,0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, 	worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FASLE, projMatrix);

	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);

	//
	// Lighting information
	// 
	gl.useProgram(program);

	var ambientUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
	var sunlightDUniformLocation = gl.getUniformLocation(program, 'sun.direction');
	var sunlightIUniformLocation = gl.getUniformLocation(program, 'sun.color');

	gl.uniform3f(ambientUniformLocation, 0.5, 0.5, 0.5);
	gl.uniform3f(sunlightDUniformLocation, -1.0, -1.0, -0.5);
	gl.uniform3f(sunlightIUniformLocation, 0.9, 0.9, 0.9);

	//
	//main render loop
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	// mat4.transpose(identityMatrix, identityMatrix);
	var angle = 0;
	var loop = function(){
		angle = performance.now() / 1000 / 6 * 2 * Math.PI;
		mat4.rotate(yRotationMatrix, identityMatrix, 0, [0, 1, 0]); 
		mat4.rotate(xRotationMatrix, identityMatrix, angle, [0, 0, 1]);
		mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

		gl.bindTexture(gl.TEXTURE_2D, susanTexture);
		gl.activeTexture(gl.TEXTURE0);
		gl.drawElements(gl.TRIANGLES, susanIndices.length, gl.UNSIGNED_SHORT, 0);
		requestAnimationFrame(loop);
			
	};

	requestAnimationFrame(loop);
	
};
