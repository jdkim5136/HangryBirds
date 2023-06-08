import {defs, tiny} from './examples/common.js';
import {Text_Line} from './examples/text-demo.js';

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
            sky: new defs.Subdivision_Sphere(4),

            custom_bird: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(4),
            tri: new defs.Triangle(),
            //tet: new defs.Tetrahedron(false),
                
        }
        console.log(this.shapes.box_1.arrays.texture_coord);

        // Cannon Variables
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
        this.restart = false;
        this.game_over = false;
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

            custom_bird_texture: new Material(new defs.Phong_Shader(),                
                {ambient: 1, diffusivity: 0, color: hex_color("#d90404")}),
        
            field_texture: new Material(new Textured_Phong(),{
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/field.png")
            }),
            seed_texture: new Material(new Textured_Phong(),{
                color: hex_color("#000000"),
                ambient: 1,diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/seed.png")
            }),
            sky_texture: new Material(new Textured_Phong(),{
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/sky.png")
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
        
        //counting birds, food
        this.add_text = new add_text(this);
        this.remaining_bird = 2;
        this.food_count = 3;
        
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Rotate Up", ["i"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if(!(this.launch)) {
                this.rotationX += Math.PI / 75.0;
            }
            if(this.rotationX < 0)
            {
                this.rotationX = 0;
            }
            if(this.rotationX > Math.PI/2)
            {
                this.rotationX = Math.PI/2;
            }
        });
        this.key_triggered_button("Rotate Down", ["k"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if(!(this.launch)) {
                this.rotationX -= Math.PI / 75.0;
            }
            if(this.rotationX < 0)
            {
                this.rotationX = 0;
            }
            if(this.rotationX > Math.PI/2)
            {
                this.rotationX = Math.PI/2;
            }
        });
        this.key_triggered_button("Rotate Left", ["j"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if(!(this.launch)) {
                this.rotationY += Math.PI / 75.0;
            }
            if(this.rotationY < -Math.PI/2)
            {
                this.rotationY =- Math.PI/2;
            }
            if(this.rotationY > Math.PI/2)
            {
                this.rotationY = Math.PI/2;
            }
        });
        this.key_triggered_button("Rotate Right", ["l"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off

            if(!(this.launch))
            {
                this.rotationY -= Math.PI / 75.0;
            }
            if(this.rotationY < -Math.PI/2)
            {
                this.rotationY =- Math.PI/2;
            }
            if(this.rotationY > Math.PI/2)
            {
                this.rotationY = Math.PI/2;
            }
        });
        this.key_triggered_button("launch", ["q"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if(!this.stopped)
            {
                this.launch=true;
                this.moving=true;
                this.flytime=0;
                this.remaining_bird-=1;
            }

        });
        this.key_triggered_button("reload", ["e"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if (!this.game_over){
                this.launch=false;
                this.moving=false;
                this.rotationX=0;
                this.rotationY=0;
                this.finalz=0;
                this.finalx=0;
                this.stopped=false;
                this.finaltheta=0;
                this.idletime+=this.flytime;
            }

        });
        this.key_triggered_button("increase power", ["u"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and of
            if(!this.game_over){
                if(!this.launch)
                {
                    this.cannon_power+=1;
                }
                if(this.cannon_power>=20)
                {
                    this.cannon_power=20;
                }
            }

        });
        this.key_triggered_button("decrease power", ["y"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            if(!this.game_over){
                if(!this.launch) {
                    this.cannon_power-=1;
                }
                if(this.cannon_power<=2)
                {
                    this.cannon_power=2;
                }
            }

        });
        
        this.key_triggered_button("Restart", ["m"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            //if restart is false, restart = true
            if (!this.restart){
                this.remaining_bird = 2;
                this.food_count = 3;
                this.launch=false;
                this.moving=false;
                this.rotationX=0;
                this.rotationY=0;
                this.finalz=0;
                this.finalx=0;
                this.stopped=false;
                this.finaltheta=0;
                this.idletime+=this.flytime;
                this.game_over = false;
            }

        });
    }

    displaypath(context,program_state, cannon,rotateX,rotateY){
        let scaler=Mat4.scale(0.08,0.08,0.08);
        for(let i=0;i<100;i+=0.05)
        {

            let tip_of_cannon = rotateY.times(rotateX.times(vec4(0,0,4,1)));

            //let rotate=Mat4.rotation(0,tip_of_cannon[0],tip_of_cannon[1],tip_of_cannon[2])
            //let translate= rotationYMat.times(shiftbackfromedge.times(Mat4.translation(0,ypos+2*Math.sin(this.rotationX),horizontal_position-2*Math.cos(this.rotationX))));

            let yintial=-tip_of_cannon[1];//2*Math.sin(this.rotationX);
            let xintial=-tip_of_cannon[0];//-2*Math.cos(this.rotationX)*Math.sin(this.rotationY);
            let zintial=-tip_of_cannon[2];//-2*Math.cos(this.rotationX)*Math.cos(this.rotationY);
            let intialHorizontalVelo=this.cannon_power*Math.cos(this.rotationX);
            let intialYVelo=this.cannon_power*Math.sin(this.rotationX);
            let ypos= yintial+intialYVelo*(i)-4.9*(i)*(i);
            let horizontal_position=-(intialHorizontalVelo*(i));
            let xpos= xintial+Math.sin(this.rotationY)*horizontal_position;
            let zpos= zintial+Math.cos(this.rotationY)*horizontal_position;
            if(ypos<=-1)
            {
                break;
            }

            let projectile_translations= Mat4.translation(xpos,ypos,zpos);
            let theta=Math.atan((intialYVelo-9.8*(i))/intialHorizontalVelo);
            let objectrotation=rotateY.times(Mat4.rotation(theta,1,0,0));//rotationYMat.times(
            this.shapes.bird.draw(context,program_state,projectile_translations.times(objectrotation.times(scaler)), this.materials.phong.override({color: hex_color("#ffd609")}));

        }
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
        // draw background
        this.sky_transform = Mat4.identity();
        this.sky_transform = this.sky_transform.times(Mat4.scale(60,60,60));
        this.shapes.sky.draw(context, program_state, this.sky_transform, this.materials.sky_texture);
         
        //draw box
        this.box_1_transform = Mat4.translation(-2, 0, -15).times(Mat4.scale(0.8,0.8,0.8));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(4, 0, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-2, 2, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(4, -2, -5));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-4, 0, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-4, 0, 0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(2,2,0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(4,0,0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-2,2,0));
        this.shapes.box_1.draw(context, program_state, this.box_1_transform, this.materials.texture);

        //chocolate
        this.chocolate_transform = Mat4.translation(2,2,-14.3);
        this.shapes.chocolate.draw(context, program_state, this.chocolate_transform, this.materials.chocolate_texture);
        this.chocolate_transform = this.chocolate_transform.times(Mat4.translation(-3.8,1.5,0));
        this.shapes.chocolate.draw(context, program_state, this.chocolate_transform, this.materials.chocolate_texture);
        //this.chocolate_transform = this.chocolate_transform.times(Mat4.translation(1,2,0));
        //this.shapes.chocolate.draw(context, program_state, this.chocolate_transform, this.materials.chocolate_texture);

        //field
        this.field_transform = Mat4.translation(0,-1,0).times(Mat4.scale(60,0.001,60))
        this.shapes.field.draw(context, program_state, this.field_transform, this.materials.field_texture);

        //seed
        this.seed_transform = Mat4.translation(0,0,-9).times(Mat4.scale(0.3,0.5,0.3)).times(Mat4.translation(0,6,-17));
        this.shapes.seed.draw(context, program_state, this.seed_transform, this.materials.seed_texture);
        this.seed_transform = this.seed_transform.times(Mat4.translation(0,3.2,-15));
        this.shapes.seed.draw(context, program_state, this.seed_transform, this.materials.seed_texture);
        this.seed_transform = this.seed_transform.times(Mat4.translation(-10.4,-6,0));
        this.shapes.seed.draw(context, program_state, this.seed_transform, this.materials.seed_texture);




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Custom Bird model
        // Change X, Y, Z coords to move the bird
        let custom_bird_x = 0;
        let custom_bird_y = 5;
        let custom_bird_z = 0;
        // red body
        this.bird_transform = Mat4.identity();
        this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.scale(0.3,0.3,0.3));
        this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture);
        // white belly
        this.bird_transform = this.bird_transform.times(Mat4.translation(0, -0.07, -0.07)).times(Mat4.scale(0.9, 1, 0.9));
        this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
        this.bird_transform = Mat4.identity();
        // Left Eye 
        this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.translation(-0.06, 0, -0.2)).times(Mat4.scale(0.12, 0.12, 0.11));
        this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
        this.bird_transform = this.bird_transform.times(Mat4.translation(-0.09, -0.37, -0.86)).times(Mat4.scale(0.14, 0.14, 0.14));
        this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
        this.bird_transform = Mat4.identity();
        // Right Eye
        this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.translation(0.06, 0, -0.2)).times(Mat4.scale(0.12, 0.12, 0.11));
        this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
        this.bird_transform = this.bird_transform.times(Mat4.translation(0.09, -0.37, -0.86)).times(Mat4.scale(0.14, 0.14, 0.14));
        this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
        this.bird_transform = Mat4.identity();
        // Eyebrows
        this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.translation(0, 0.1, -0.28)).times(Mat4.scale(0.2, 0.022, 0.022));
        this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
        this.bird_transform = Mat4.identity();
        // Hair On Top
        this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.translation(0, 0.29, 0)).times(Mat4.scale(0.022, 0.1, 0.022));
        this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
        this.bird_transform = this.bird_transform.times(Mat4.rotation(0.3, 0.5, 1.3, 1)).times(Mat4.translation(-3, 0.5, 1));
        this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
        this.bird_transform = this.bird_transform.times(Mat4.rotation(0.3, -0.5, -1.1, 1)).times(Mat4.translation(4.7, -1.5, 1));
        this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
        
        // Beak (WIP)
        this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.translation(0, -0.1, -0.3)).times(Mat4.scale(0.11, 0.06, 1));
        this.bird_transform = this.bird_transform.times(Mat4.rotation(0, 0, 0, 1));
        this.shapes.tri.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));
        this.bird_transform = Mat4.identity();
        this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.translation(0, -0.1, -0.3)).times(Mat4.scale(0.11, 0.06, 1));
        this.bird_transform = this.bird_transform.times(Mat4.rotation(Math.PI/2, 0, 0, 1));
        this.shapes.tri.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));


        // this.bird_transform = Mat4.identity();
        // this.bird_transform = Mat4.translation(custom_bird_x, custom_bird_y, custom_bird_z).times(Mat4.translation(1, 1, -1)).times(Mat4.scale(1, 1, 1));
        // this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));
        
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            


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
            this.displaypath(context,program_state,cannon_transform,rotationXMat,rotationYMat)
        }

        //if launchingiih/lauched change bird coords
        else
        {
            this.flytime+=dt;
            let tip_of_cannon = rotationYMat.times(rotationXMat.times(vec4(0,0,4,1)));

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
        
        //display text
        let lives = this.add_text.create_text(
            this.add_text.transformation_function([-3.5,-1.6,-5],[0.1,0.1,1]), "Birds: "+  this.remaining_bird
        );
        let power = this.add_text.create_text(
            this.add_text.transformation_function([-3.5,-1.9,-5],[0.1,0.1,1]), "Power: "+ this.cannon_power
        );
        let food = this.add_text.create_text(
            this.add_text.transformation_function([-3.5,-1.3,-5],[0.1,0.1,1]), "Food: "+ this.food_count
        );
        let game_over = this.add_text.create_text(
            this.add_text.transformation_function([-3.4,0.4,-5],[0.5,0.5,1]), "Game Over!"
        );
        let restart = this.add_text.create_text(
            this.add_text.transformation_function([-3.4,-0.5,-5],[0.15,0.15,1]), "Press \'m\' to Restart the game!"
        );

        if (this.remaining_bird < 0){
            lives["shape"].set_string("Birds: 0", context.context);
        }
        else{
            lives["shape"].set_string(lives.text, context.context);
        }
        
        lives["shape"].draw(context,program_state,lives["transform"](program_state.camera_inverse),lives["material"]);
        power["shape"].set_string(power.text, context.context);
        power["shape"].draw(context,program_state,power["transform"](program_state.camera_inverse),power["material"]);
        food["shape"].set_string(food.text, context.context);
        food["shape"].draw(context,program_state,food["transform"](program_state.camera_inverse),food["material"]);



        //display game over
        //if remaining_bird < 0 and food > 1
        if (this.remaining_bird < 0 && this.food_count > 0){
            game_over["shape"].set_string(game_over.text, context.context);
            game_over["shape"].draw(context,program_state,game_over["transform"](program_state.camera_inverse),game_over["material"]);
            restart["shape"].set_string(restart.text, context.context);
            restart["shape"].draw(context,program_state,restart["transform"](program_state.camera_inverse),restart["material"]);
            this.game_over = true;
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

export class add_text{
    constructor(parent){
        this.parent = parent;
        this.shapes = {
            text_shape: new Text_Line(10),
        }
        this.materials = {
            text_texture: new Material(new Textured_Phong(),{
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
        }
    }

    transformation_function(translation_coord, scale_factor=[1,1,1]){
        function transform(camera_matrix){
            camera_matrix = Mat4.inverse(camera_matrix);
            camera_matrix = camera_matrix.times(Mat4.translation(...translation_coord));
            camera_matrix = camera_matrix.times(Mat4.scale(...scale_factor));
            return camera_matrix;
        }
        return transform;
    }

    create_text(transform, text){
        return{
            "shape": this.shapes.text_shape,
            "material": this.materials.text_texture,
            "transform": transform,
            "text": text
        }
    }



}
