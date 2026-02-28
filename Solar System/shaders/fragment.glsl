precision mediump float;

varying vec3 v_normal;
varying vec3 v_worldPos;

uniform vec3 u_lightPos;
uniform vec3 u_viewPos;
uniform vec3 u_color;

void main(){
    vec3 ka = vec3(0.0,0.1,0.0); // ambient coefficients
    vec3 kd = vec3(0.0,0.4,0.0); // diffuse coefficients
    vec3 ks = vec3(0.5,0.5,0.5); // specular coefficients
    float se = 25.0; // specular power constant

    vec3 normal = normalize(v_normal);

    // Diffuse Lightin
    vec3 lightDir = normalize(u_lightPos - v_worldPos); // Fragment to light
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = u_color * diff;

    // Ambient Lighting
    vec3 ambient = ka * u_color;

    // Specular Lighting 
    vec3 viewDir = normalize(u_viewPos, v_wordPos); //Fragment to Camera
    vec3 reflectDir = reflect(-lightDir, normal); 
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), se);
    vec3 specular = ks * spec;

    // Final Colour using Phong Model
    vec3 color = ambient + diffuse + specular;
    gl_FragColor = vec4(color, 1.0);
}