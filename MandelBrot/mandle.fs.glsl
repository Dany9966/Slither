precision highp float;

uniform vec2 viewportDimensions;
uniform float minI;
uniform float maxI;
uniform float minR;
uniform float maxR;

void main(){
	vec2 c = vec2(
			gl_FragCoord.x * (maxR - minR) / viewportDimensions.x + minR,
			gl_FragCoord.y * (maxI - minI) / viewportDimensions.y + minI
		);

	vec2 z = c;
	float iterations = 0.0;
	float maxIterations = 4000.0;
	const int maxii = 4000;

	for(int i = 0; i < maxii; i++){
		float t = 2.0 * z.x * z.y + c.y;
		z.x = z.x * z.x - z.y * z.y + c.x;
		z.y = t;

		if(z.x * z.x + z.y * z.y > 4.0){
			break;
		}

		iterations += 1.0;
	}

	if(iterations < maxIterations){
		discard;
	} else {
		gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
	}
}