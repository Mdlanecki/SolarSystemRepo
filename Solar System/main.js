import { initShaderProgram } from "./shaderManager.js";
const {mat3, mat4, vec3, vec4, glMatrix : glm} = glMatrix;


// Camera control variables
let cameraPos   = vec3.fromValues(0, 5, 15);
let cameraFront = vec3.fromValues(0, 0, -1);
let cameraUp    = vec3.fromValues(0, 1, 0);

let yaw   = -90;
let pitch = 0;
let keys = {};

// Sun model matrix
let sunModel = mat4.create();
mat4.scale(sunModel, sunModel, [2,2,2]);

// Planet model matrix
let planetModel = mat4.create();
mat4.rotateY(planetModel, planetModel, Math.PI / 4);
mat4.translate(planetModel, planetModel, [6, 0, 0]);

// Moon model matrix
let moonModel = mat4.clone(planetModel);
mat4.rotateY(moonModel, moonModel, Math.PI / 2);
mat4.translate(moonModel, moonModel, [2,0,0]);
mat4.scale(moonModel, moonModel, [0.4, 0.4, 0.4]);



async function main(){
    const canvas = document.getElementById("glcanvas")
    const gl = canvas.getContext("webgl")

    if (!gl){
        alert("WebGL not supported");
    }

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);

    const program = await initShaderProgram(gl);
    gl.useProgram(program);

    console.log("Shader program compiled and linked");





    //---------------------
    // User Interaction
    //---------------------
    window.addEventListener("keydown", e => keys[e.key] = true);
    window.addEventListener("keyup", e => keys[e.key] = false);

    canvas.addEventListener("click", () => {
        if (document.pointerLockElement !== canvas) {
            canvas.requestPointerLock().catch(err => {
                console.warn("Pointer lock failed:", err);
            });
        }
    });

    document.addEventListener("mousemove", (e) => {
        if (document.pointerLockElement !== canvas) return;

        const sensitivity = 0.1;
        yaw   += e.movementX * sensitivity;
        pitch -= e.movementY * sensitivity;

        pitch = Math.max(-89, Math.min(89, pitch));

        const front = vec3.create();
        front[0] = Math.cos(glm.toRadian(yaw)) * Math.cos(glm.toRadian(pitch));
        front[1] = Math.sin(glm.toRadian(pitch));
        front[2] = Math.sin(glm.toRadian(yaw)) * Math.cos(glm.toRadian(pitch));
        vec3.normalize(cameraFront, front);
    });






    // Create sphere template data
    const sphereData = createSphere(1, 30, 30);
    const positions = new Float32Array(sphereData.positions);
    const normals = new Float32Array(sphereData.normals);

    // Create Buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    const indices = createSphereIndices(30, 30);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Get attribute locations
    const aPositionLoc = gl.getAttribLocation(program, "a_position");
    const aNormalLoc = gl.getAttribLocation(program, "a_normal");

    // Enable & set attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.enableVertexAttribArray(aNormalLoc);
    gl.vertexAttribPointer(aNormalLoc, 3, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const uModelLoc = gl.getUniformLocation(program, "u_model");
    const uViewLoc = gl.getUniformLocation(program, "u_view");
    const uProjectionLoc = gl.getUniformLocation(program, "u_projection");
    const uColorLoc = gl.getUniformLocation(program, "u_color");
    const uLightPosLoc = gl.getUniformLocation(program, "u_lightPos");
    const uViewPosLoc  = gl.getUniformLocation(program, "u_viewPos");
    const uIsSunLoc    = gl.getUniformLocation(program, "u_isSun");

    // Camera setup
    const projection = mat4.create()
    mat4.perspective(projection, Math.PI / 4, canvas.width / canvas.height, 0.1, 100); //fov, aspect, near, far
    gl.uniformMatrix4fv(uProjectionLoc, false, projection);

    const view = mat4.create();
    mat4.lookAt(view, [0, 5, 15], [0, 0, 0], [0, 1, 0]); // eye, target, up
    gl.uniformMatrix4fv(uViewLoc, false, view);

    // Draw Scene

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw Sun
    gl.uniformMatrix4fv(uModelLoc, false, sunModel);
    gl.uniform3f(uColorLoc, 1.0, 0.8, 0.1);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Draw Planet
    gl.uniformMatrix4fv(uModelLoc, false, planetModel);
    gl.uniform3f(uColorLoc, 0.2, 0.4, 1.0); // Blue Planet
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Draw Moon
    gl.uniformMatrix4fv(uModelLoc, false, moonModel);
    gl.uniform3f(uColorLoc, 0.7, 0.7, 0.7); // Gray moon
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Animate the movements of the Solar System
    function render(time){
        time *= 0.001;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        // Camera Movement
        const speed = 0.1;
        let right = vec3.create();
        vec3.cross(right, cameraFront, cameraUp);
        vec3.normalize(right, right);

        if (keys["w"]) vec3.scaleAndAdd(cameraPos, cameraPos, cameraFront, speed);
        if (keys["s"]) vec3.scaleAndAdd(cameraPos, cameraPos, cameraFront, -speed);
        if (keys["a"]) vec3.scaleAndAdd(cameraPos, cameraPos, right, -speed);
        if (keys["d"]) vec3.scaleAndAdd(cameraPos, cameraPos, right, speed);
        if (keys["q"]) vec3.scaleAndAdd(cameraPos, cameraPos, cameraUp, speed);
        if (keys["e"]) vec3.scaleAndAdd(cameraPos, cameraPos, cameraUp, -speed);

        // Animate Sun
        let sunModelAnim = mat4.clone(sunModel);
        mat4.rotateY(sunModelAnim, sunModelAnim, time * 0.1);

        // Sun world-space position for light
        let sunWorldPos = vec3.create();
        vec3.transformMat4(sunWorldPos, [0, 0, 0], sunModelAnim);
        gl.uniform3f(uLightPosLoc, sunWorldPos[0], sunWorldPos[1], sunWorldPos[2]);
        

        // Draw Sun (emissive)
        gl.uniform1i(uIsSunLoc, 1);
        gl.uniformMatrix4fv(uModelLoc, false, sunModelAnim);
        gl.uniform3f(uColorLoc, 1.0, 0.8, 0.1);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // Planet Animation (orbit around sun)
        let planetModelAnim = mat4.create();
        mat4.rotateY(planetModelAnim, planetModelAnim, time * 0.5);
        mat4.translate(planetModelAnim, planetModelAnim, [6, 0, 0]);
        gl.uniform1i(uIsSunLoc, 0);
        gl.uniformMatrix4fv(uModelLoc, false, planetModelAnim);
        gl.uniform3f(uColorLoc, 0.2, 0.4, 1.0);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // Moon Animation (orbit around planet)
        let moonModelAnim = mat4.clone(planetModelAnim);
        mat4.rotateY(moonModelAnim, moonModelAnim, time * 2.0);
        mat4.translate(moonModelAnim, moonModelAnim, [2, 0, 0]);
        mat4.scale(moonModelAnim, moonModelAnim, [0.4, 0.4, 0.4]);
        gl.uniformMatrix4fv(uModelLoc, false, moonModelAnim);
        gl.uniform3f(uColorLoc, 0.7, 0.7, 0.7);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        // Camera position 

        let view = mat4.create();
        let target = vec3.create();
        vec3.add(target, cameraPos, cameraFront);

        mat4.lookAt(view, cameraPos, target, cameraUp);

        gl.uniformMatrix4fv(uViewLoc, false, view);
        gl.uniform3f(uViewPosLoc, cameraPos[0], cameraPos[1], cameraPos[2]);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();



// Generates sphere vertices
function createSphere(radius, latBands, lonBands){
    const positions = [];
    const normals = [];

    for(let lat=0; lat<=latBands; lat++){
        const theta = lat * Math.PI / latBands;
        const sinT = Math.sin(theta);
        const costT = Math.cos(theta);

        for (let lon=0; lon<=lonBands; lon++){
            const phi = lon * 2 * Math.PI / lonBands;
            const x = Math.cos(phi) * sinT;
            const y = costT;
            const z = Math.sin(phi) * sinT;

            positions.push(radius * x, radius * y, radius * z);
            normals.push(x, y, z);
        }

    }

    return {positions, normals};
}

function createSphereIndices(latBands, lonBands){
    const indices = [];

    for(let lat=0; lat<latBands; lat++){
        for(let lon=0; lon<lonBands; lon++){
            const first = lat * (lonBands+1) + lon;
            const second = first + lonBands + 1;

            // Triangle 1
            indices.push(first, second, first+1);
            
            // Triangle 2
            indices.push(second, second + 1, first + 1);
        }
    }

    return new Uint16Array(indices);
}






