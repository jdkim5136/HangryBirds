import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class Project extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        this.shapes = {
            box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows(),
            chocolate: new defs.Square(),
            bird: new  defs.Subdivision_Sphere(4),
        }
        console.log(this.shapes.box_1.arrays.texture_coord);
        this.rotationX=0;
        this.rotationY=0;
        this.launch=false;
        this.idletime=0;
        this.moving=false;
        this.finalz=0;
        this.finalx=0;
        this.flytime=0;
        this.cannon_power=10;
        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/wooden_crate2.jpg")
            }),
            chocolate_texture: new Material(new Textured_Phong(),{
                color: hex_color("#000000"),
                ambient:1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/Chocolate.png")
            }),
            bird_texture: new Material(new Textured_Phong(),{
                color: hex_color("#000000"),
                ambient: 1,diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/birds.jpg")
            })
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.shapes.bird.arrays.texture_coord.forEach(
            (v,i,l) => v[0] = v[0] * 2
        )
        //this.shapes.bird.arrays.texture_coord.forEach(
        // (v,i,l) => v[1] = v[1] * 2
        //)
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Rotate Up", ["i"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.rotationX+=Math.PI/18.0;
            if(this.rotationX<0)
            {
                this.rotationX=0;
            }
            if(this.rotationX>Math.PI/2)
            {
                this.rotationX=Math.PI/2;
            }
        });
        this.key_triggered_button("Rotate Down", ["k"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.rotationX-=Math.PI/18.0;
            if(this.rotationX<0)
            {
                this.rotationX=0;
            }
            if(this.rotationX>Math.PI/2)
            {
                this.rotationX=Math.PI/2;
            }
        });
        this.key_triggered_button("Rotate Left", ["j"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.rotationY+=Math.PI/18.0;
            if(this.rotationY<-Math.PI/2)
            {
                this.rotationY=-Math.PI/2;
            }
            if(this.rotationY>Math.PI/2)
            {
                this.rotationY=Math.PI/2;
            }
        });
        this.key_triggered_button("Rotate Right", ["l"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.rotationY-=Math.PI/18.0;
            if(this.rotationY<-Math.PI/2)
            {
                this.rotationY=-Math.PI/2;
            }
            if(this.rotationY>Math.PI/2)
            {
                this.rotationY=Math.PI/2;
            }
        });
        this.key_triggered_button("launch", ["q"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.launch=true;
            this.moving=true;
        });
        this.key_triggered_button("reload", ["e"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.launch=false;
            this.moving=false;
            this.rotationX=0;
            this.rotationY=0;
            this.finalz=0;
            this.finalx=0;
            this.idletime+=this.flytime;

        });
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -8));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // You can remove the folloeing line.
        this.box_1_transform = Mat4.translation(-2, 0, 0);
        let cannon_transform =Mat4.identity();
        let scale =Mat4.scale(0.5,0.5,2);
        //rotating cannon code:

        let rotationXMat =Mat4.rotation(this.rotationX,1,0,0);
        let rotationYMat =Mat4.rotation(this.rotationY,0,1,0);
        let shifttoedge=Mat4.translation(0,0,1,)

        let shiftbackfromedge=Mat4.translation(0,0,-1,)
        cannon_transform=cannon_transform.times(shifttoedge.times(rotationYMat.times(rotationXMat.times(shiftbackfromedge))));
        let cannon_transformscaled=cannon_transform.times(scale);
        let total_rotation= rotationYMat.times(rotationXMat);
        let cannon_normal = vec4(0,0,1,0);
        cannon_normal= total_rotation.times(cannon_normal);
        //this is the intial velo mag of the bird
        let cannon_power=10;
        let bird_startingPosition=Mat4.translation(0,0,-2);
        bird_startingPosition=cannon_transform.times(bird_startingPosition);
        let birdscale=Mat4.scale(0.5,0.5,0.5);




        if(!(this.launch))
        {
            this.idletime=this.idletime+dt;
            this.shapes.bird.draw(context,program_state,bird_startingPosition.times(birdscale), this.materials.bird_texture);


        }
        else{
            this.flytime+=dt;
            let yintial=2*Math.sin(this.rotationX);
            let xintial=-2*Math.cos(this.rotationX)*Math.sin(this.rotationY);
            let zintial=-2*Math.cos(this.rotationX)*Math.cos(this.rotationY);
            let intialZVelo=cannon_power*Math.cos(this.rotationX);
            let intialYVelo=cannon_power*Math.sin(this.rotationX);
            let ypos= yintial+intialYVelo*(t-this.idletime)-4.9*(t-this.idletime)*(t-this.idletime);
            let horizontal_position=-(intialZVelo*(t-this.idletime));
            let xpos= xintial+Math.sin(this.rotationY)*horizontal_position;
            let zpos= zintial+Math.cos(this.rotationY)*horizontal_position;

            if(ypos<=0&&this.moving)
            {
                this.moving=false;
                ypos = 0;
                this.finalz=zpos;
                this.finalx=xpos;
            }
            else if(!this.moving)
            {
                ypos = 0;
                zpos=this.finalz;
                xpos=this.finalx;
            }
            let projectile_translations= Mat4.translation(xpos,ypos,zpos);
            this.shapes.bird.draw(context,program_state,projectile_translations.times(birdscale), this.materials.bird_texture);

        }



        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.shapes.box_2.draw(context, program_state,cannon_transformscaled,this.materials.phong)

        this.chocolate_transform = Mat4.translation(2,0,0);
        this.shapes.chocolate.draw(context, program_state, this.chocolate_transform, this.materials.chocolate_texture);

    }
}


class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}


class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

