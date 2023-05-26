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
            field: new Cube(),
            seed: new  defs.Subdivision_Sphere(4),
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
        this.stopped=false;
        this.finaltheta=0;
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
            }),
            field_texture: new Material(new Textured_Phong(),{
                color: hex_color("#000000"),
                ambient: 1,diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/field.png")
            }),
            seed_texture: new Material(new Textured_Phong(),{
                color: hex_color("#000000"),
                ambient: 1,diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/seed.png")
            }),

        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.shapes.bird.arrays.texture_coord.forEach(
            (v,i,l) => v[0] = v[0] * 2
        )
        this.shapes.field.arrays.texture_coord.forEach(
            (v,i,l) => v[0] = v[0] * 10
        )
        this.shapes.field.arrays.texture_coord.forEach(
            (v,i,l) => v[1] = v[1] * 10
        )
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Rotate Up", ["i"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if(!(this.launch)) {
                this.rotationX += Math.PI / 18.0;
            }
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
            if(!(this.launch)) {
                this.rotationX -= Math.PI / 18.0;
            }
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
            if(!(this.launch)) {
                this.rotationY += Math.PI / 18.0;
            }
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

            if(!(this.launch))
            {
                this.rotationY-=Math.PI/18.0;
            }
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
            if(!this.stopped)
            {
                this.launch=true;
                this.moving=true;
                this.flytime=0;
            }

        });
        this.key_triggered_button("reload", ["e"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.launch=false;
            this.moving=false;
            this.rotationX=0;
            this.rotationY=0;
            this.finalz=0;
            this.finalx=0;
            this.stopped=false;
            this.finaltheta=0;
            this.idletime+=this.flytime;

        });
        this.key_triggered_button("increase power", ["u"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and of
            if(!this.launch)
            {
                this.cannon_power+=5;
            }

        });
        this.key_triggered_button("decrease power", ["y"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if(!this.launch) {
                this.cannon_power-=5;
            }
            if(this.cannon_power<=5)
            {
                this.cannon_power=5;
            }

        });
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, -4, -12));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.

        //draw box
        this.box_1_transform = Mat4.translation(-2, 0, -5).times(Mat4.scale(0.8,0.8,0.8));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-1, 2, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(2, 0, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(2, 0, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(2, 0, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-1, -2, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-2,4,0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(4,0,0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-2,2,0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);

        //chocolate
        this.chocolate_transform = Mat4.translation(0,0,-4);
        this.shapes.chocolate.draw(context, program_state, this.chocolate_transform, this.materials.chocolate_texture);
        this.chocolate_transform = this.chocolate_transform.times(Mat4.translation(-2,3,-1));
        this.shapes.chocolate.draw(context, program_state, this.chocolate_transform, this.materials.chocolate_texture);
        this.chocolate_transform = this.chocolate_transform.times(Mat4.translation(1,2,0));
        this.shapes.chocolate.draw(context, program_state, this.chocolate_transform, this.materials.chocolate_texture);

        //field
        this.field_transform = Mat4.translation(0,-1,0).times(Mat4.scale(10,0.001,10))
        this.shapes.field.draw(context, program_state, this.field_transform, this.materials.field_texture);

        //seed
        this.seed_transform = Mat4.translation(1,0,0).times(Mat4.scale(0.3,0.5,0.3)).times(Mat4.translation(0,6,-17));
        this.shapes.seed.draw(context, program_state, this.seed_transform, this.materials.seed_texture);
        this.seed_transform = this.seed_transform.times(Mat4.translation(6,-7,0));
        this.shapes.seed.draw(context, program_state, this.seed_transform, this.materials.seed_texture);
        this.seed_transform = this.seed_transform.times(Mat4.translation(0,10,0));
        this.shapes.seed.draw(context, program_state, this.seed_transform, this.materials.seed_texture);


        //rotating cannon code:
        let cannon_transform =Mat4.identity();
        let scalebarrel =Mat4.scale(0.5,0.5,2);
        let scalebase =Mat4.scale(0.75,0.75,1);
        let base_transform=Mat4.translation(0,0,1)
        let wheelscale=Mat4.scale(0.3,0.7,0.7);

        let rotationXMat =Mat4.rotation(this.rotationX,1,0,0);
        let rotationYMat =Mat4.rotation(this.rotationY,0,1,0);
        let shifttoedge=Mat4.translation(0,0,-2,)

        let shiftbackfromedge=Mat4.translation(0,0,2,)
        //removed shiftbackfromedge
        cannon_transform=cannon_transform.times(rotationYMat.times(rotationXMat.times(shifttoedge)));
        //let cannon_transformscaled=cannon_transform.times(scale);
        this.shapes.box_2.draw(context, program_state,cannon_transform.times(scalebarrel),this.materials.phong);
        this.shapes.box_2.draw(context, program_state,cannon_transform.times(base_transform.times(scalebase)),this.materials.phong)
        this.shapes.box_2.draw(context, program_state,cannon_transform.times(shiftbackfromedge.times(Mat4.scale(1,0.2,0.2))),this.materials.phong)
        this.shapes.box_2.draw(context, program_state,rotationYMat.times(Mat4.translation(1.1,0,0).times(wheelscale)),this.materials.phong)
        this.shapes.box_2.draw(context, program_state,rotationYMat.times(Mat4.translation(-1.1,0,0).times(wheelscale)),this.materials.phong)

        //set up birds coords while aiming
        let bird_startingPosition=Mat4.translation(0,0,-2);
        bird_startingPosition=cannon_transform.times(bird_startingPosition);
        let birdscale=Mat4.scale(0.3,0.3,0.3);





        if(!(this.launch))
        {
            this.idletime=this.idletime+dt;
            this.shapes.bird.draw(context,program_state,bird_startingPosition.times(birdscale), this.materials.bird_texture);
        }

        //if launching/lauched change bird coords
        else
        {
            this.flytime+=dt;
            let tip_of_cannon = rotationYMat.times(rotationXMat.times(vec4(0,0,2,1)));

            //let rotate=Mat4.rotation(0,tip_of_cannon[0],tip_of_cannon[1],tip_of_cannon[2])
            //let translate= rotationYMat.times(shiftbackfromedge.times(Mat4.translation(0,ypos+2*Math.sin(this.rotationX),horizontal_position-2*Math.cos(this.rotationX))));

            let yintial=-tip_of_cannon[1];//2*Math.sin(this.rotationX);
            let xintial=-tip_of_cannon[0];//-2*Math.cos(this.rotationX)*Math.sin(this.rotationY);
            let zintial=-tip_of_cannon[2];//-2*Math.cos(this.rotationX)*Math.cos(this.rotationY);
            let intialHorizontalVelo=this.cannon_power*Math.cos(this.rotationX);
            let intialYVelo=this.cannon_power*Math.sin(this.rotationX);
            let ypos= yintial+intialYVelo*(t-this.idletime)-4.9*(t-this.idletime)*(t-this.idletime);
            let horizontal_position=-(intialHorizontalVelo*(t-this.idletime));
            let xpos= xintial+Math.sin(this.rotationY)*horizontal_position;
            let zpos= zintial+Math.cos(this.rotationY)*horizontal_position;

            let theta=Math.atan((intialYVelo-9.8*(t-this.idletime))/intialHorizontalVelo);



            if(!this.moving)
            {
                ypos = -1;
                zpos=this.finalz;
                xpos=this.finalx;
                theta=this.finaltheta
            }
            else if(ypos<=-1&&this.moving&&!(this.stopped))
            {
                this.moving=false;
                this.stopped=true;
                ypos = -1;
                this.finalz=zpos;
                this.finalx=xpos;
                this.finaltheta=theta;
            }
            let projectile_translations= Mat4.translation(xpos,ypos,zpos);
            let birdrotation=rotationYMat.times(Mat4.rotation(theta,1,0,0));//rotationYMat.times(
            //let birdrotation=rotationYMat.times(rotationXMat);

            this.shapes.bird.draw(context,program_state,projectile_translations.times(birdrotation.times(birdscale)), this.materials.bird_texture);
        }


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

