#ifdef GL_ES
precision highp float;
#endif

varying highp vec3 vNormal;
varying highp vec3 vEyeVec;
varying highp vec3 vFragPos;
varying vec2 vTextureCoord;

struct MaterialProperties {
    vec4 ambient;                   // Default: (0, 0, 0, 1)
    vec4 diffuse;                   // Default: (0, 0, 0, 1)
    vec4 specular;                  // Default: (0, 0, 0, 1)
    float shininess;                // Default: 0 (possible values [0, 128])
};


struct Light {
	bool isDisabled;
	bool isSpot;    
    vec3 position;
    vec3 direction;

    float constant;
    float linear;
    float quadratic;  

    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
};  


#define NR_POINT_LIGHTS 8 
uniform Light lights[NR_POINT_LIGHTS];
uniform int nLights;
uniform MaterialProperties uFrontMaterial;
uniform sampler2D uSampler;
uniform float timeFactor;
uniform vec3 targetColor;

vec4 CalcLight(Light light, vec3 normal, vec3 fragPos, vec3 viewDir, bool target)
{	
	if (light.isDisabled) return vec4(0, 0, 0, 0);
	vec3 lightDir;
	if (light.isSpot) {
		vec3 lightDir = normalize(-light.direction);
	} else {
		vec3 lightDir = normalize(light.position - fragPos);
	}

	
	// diffuse shading
	float diff = max(dot(normal, lightDir), 0.0);
	// specular shading
	vec3 reflectDir = reflect(-lightDir, normal);
	
	float spec = pow(max(dot(viewDir, reflectDir), 0.0), uFrontMaterial.shininess);

	vec4 ambient, diffuse, specular;

	if (target) {
		ambient  = light.ambient  * 0.1 * vec4(targetColor, 1.0);
		diffuse  = light.diffuse  * diff * vec4(targetColor, 1.0);
		specular = light.specular * spec * vec4(targetColor, 1.0);
	} else {
		ambient  = light.ambient  * 0.3 * uFrontMaterial.ambient;
		diffuse  = light.diffuse  * diff * uFrontMaterial.diffuse;
		specular = light.specular * spec * uFrontMaterial.specular;
	}
	
	if (!light.isSpot) {
		// attenuation
		float distance    = length(light.position - fragPos);
		float attenuation = 1.0 / (light.constant + light.linear * distance + 
					light.quadratic * (distance * distance));    
		ambient  *= attenuation;
		diffuse  *= attenuation;
		specular *= attenuation;
	}
	
	
	return (ambient + diffuse + specular);
    
}  



void main() {

	// properties
    vec3 norm = normalize(vNormal);
    vec3 viewDir = normalize(vEyeVec - vFragPos);

	vec4 result = vec4(0, 0, 0, 1);
	vec4 resultTarget = vec4(0, 0, 0, 1);

    for(int i = 0; i < NR_POINT_LIGHTS; i++)
        result += CalcLight(lights[i], norm, vFragPos, viewDir, false);    

	for(int i = 0; i < NR_POINT_LIGHTS; i++)
		resultTarget += CalcLight(lights[i], norm, vFragPos, viewDir, true);    

	vec4 texColor = texture2D(uSampler, vTextureCoord+vec2(timeFactor*.01,0.0));

	vec4 color = result  + (resultTarget  - result) * timeFactor;

	gl_FragColor = texColor * color;

}

