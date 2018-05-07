precision mediump float;

struct DirectionalLight{
	vec3 direction;
	vec3 color;	
};

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform sampler2D sampler;
uniform vec3 ambientLightIntensity;
uniform DirectionalLight sun;

void main()
{
	// vec3 ambientLightIntensity = vec3(0.2, 0.2, 0.3);
	// vec3 sunlightIntensity = vec3(0.9, 0.9, 0.9);
	// vec3 sunlightDirection = normalize(vec3(0.5, 0.0, -0.5));
	vec3 surfaceNormal = normalize(fragNormal);
	vec3 normSunlightD = normalize(sun.direction);
	vec4 texel = texture2D(sampler, fragTexCoord);

	vec3 lightIntensity = ambientLightIntensity + 
							sun.color * max(dot(fragNormal, normSunlightD), 0.0);
	

	gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);

	// gl_FragColor = texture2D(sampler, fragTexCoord);
}
