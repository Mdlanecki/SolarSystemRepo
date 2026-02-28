precision mediump float;

varying vec3 v_normal;
varying vec3 v_worldPos;

uniform vec3 u_lightPos;
uniform vec3 u_viewPos;
uniform vec3 u_color;
uniform int u_isSun;

void main(){

    if (u_isSun == 1) {
        gl_FragColor = vec4(u_color, 1.0);
        return;
    }

    vec3 normal = normalize(v_normal);

    // Diffuse 
    vec3 lightDir = normalize(u_lightPos - v_worldPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = u_color * diff;

    // Ambient 
    vec3 ambient = 0.2 * u_color;

    // Specular 
    vec3 viewDir = normalize(u_viewPos - v_worldPos);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 20.0);
    vec3 specular = vec3(1.0, 0.9, 0.7) * spec;

    // Final Colour using Phong Model
    vec3 color = ambient + diffuse + specular;
    gl_FragColor = vec4(color, 1.0);
}