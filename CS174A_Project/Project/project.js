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
            tet: new defs.Tetrahedron(),
                
        }

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
        this.launchtime=0;
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
        this.remaining_bird = 3;
        this.food_count = 3;
        
        this.box_list = [];
        this.box_transform_list = [];
        this.box_keep_list = [0,1,2,3,4,5,6,7,8];
        this.hit_box = false;

        this.chocolate_list = []; //save the 3d location for the chocolate
        this.chocolate_keep_list = [0,1]; //save the index of all chocolate
        this.chocolate_transform_list = []; //save the transformation matrix
        this.hit_chocolate = false;

        this.seed_list = [];
        this.seed_transform_list = [];
        this.seed_keep_list = [0,1,2];
        this.hit_seed = false;
        this.reloaded = false;
        this.bird_coord = undefined;
    }

    make_control_panel() {
        this.key_triggered_button("Rotate Up", ["i"], () => {
            if(!(this.launch)) {
                this.rotationX += Math.PI / 75.0;
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
            if(!(this.launch)) {
                this.rotationX -= Math.PI / 75.0;
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
            if(!(this.launch)) {
                this.rotationY += Math.PI / 75.0;
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

            if(!(this.launch))
            {
                this.rotationY-=Math.PI / 75.0;
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
            if(!this.stopped)
            {
                this.launch=true;
                this.moving=true;
                this.flytime=0;
                this.remaining_bird-=1;
                this.reloaded = false;
            }

        });
        this.key_triggered_button("reload", ["e"], () => {
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
                this.hit_chocolate = false;
                this.hit_box = false;
                this.hit_seed = false;
                this.reloaded = true;
                this.launchtime=0;
            }

        });
        this.key_triggered_button("increase power", ["u"], () => {
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
            //if restart is false, restart = true
            if (!this.restart){
                this.remaining_bird = 3;
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
                this.chocolate_keep_list = [0,1];
                this.hit_chocolate=false;
                this.hit_box = false;
                this.box_keep_list = [0,1,2,3,4,5,6,7,8];
                this.hit_seed = false;
                this.seed_keep_list = [0,1,2];
                this.reloaded = false;
                this.bird_coord = undefined;
                this.launchtime=0;
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
    
    collision(object1, object2){
        let distance = Math.sqrt(((object1[0] - object2[0]) ** 2) + ((object1[1] - object2[1]) ** 2) + ((object1[2] - object2[2])** 2));
        if(distance <= 1){
            return true;
        }
        else{
            return false;
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


        // draw background
        this.sky_transform = Mat4.identity();
        this.sky_transform = this.sky_transform.times(Mat4.scale(60,60,60));
        this.shapes.sky.draw(context, program_state, this.sky_transform, this.materials.sky_texture);

        //draw box
        const arrayColumn = (arr, n) => arr.map(x=>x[n]);
        this.box_list = [];
        this.box_transform_list = [];
        //box 0
        this.box_1_transform = Mat4.translation(-2, 0, -15).times(Mat4.scale(0.8,0.8,0.8));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 1
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(4, 0, 0));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 2
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-2, 2, 0));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 3
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(4, -2, -5));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 4
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-4, 0, 0));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 5
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-4, 0, 0));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 6
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(2,2,0));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 7
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(4,0,0));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));
        //box 8
        this.box_1_transform = this.box_1_transform.times(Mat4.translation(-2,2,0));
        this.box_transform_list.push(this.box_1_transform);
        this.box_list.push(arrayColumn(this.box_1_transform,3));

        for (let i = 0; i < this.box_keep_list.length; i++){
            let a = this.box_transform_list[this.box_keep_list[i]];
            //draw the box if it haven't been hit by the bird
            this.shapes.box_1.draw(context, program_state, a, this.materials.texture);
        }
        
        //chocolate
       this.chocolate_list = [];
        this.chocolate_transform_list=[];
        this.chocolate_transform = Mat4.translation(2,2,-14.3);
        this.chocolate_transform_list.push(this.chocolate_transform);
        this.chocolate_list.push(arrayColumn(this.chocolate_transform,3));
        this.chocolate_transform = this.chocolate_transform.times(Mat4.translation(-3.3,1.5,0));
        this.chocolate_transform_list.push(this.chocolate_transform);
        this.chocolate_list.push(arrayColumn(this.chocolate_transform,3));
        for (let i = 0; i < this.chocolate_keep_list.length; i++){
            let a = this.chocolate_transform_list[this.chocolate_keep_list[i]];
            this.shapes.chocolate.draw(context, program_state, a, this.materials.chocolate_texture);
        }
        
        //field
        this.field_transform = Mat4.translation(0,-1,0).times(Mat4.scale(60,0.001,60))
        this.shapes.field.draw(context, program_state, this.field_transform, this.materials.field_texture);

        //seed
        this.seed_list = [];
        this.seed_transform_list=[];
        this.seed_transform = Mat4.translation(0,0,-9).times(Mat4.scale(0.3,0.5,0.3)).times(Mat4.translation(0,6,-17));
        this.seed_transform_list.push(this.seed_transform);
        this.seed_list.push(arrayColumn(this.seed_transform,3));
        this.seed_transform = this.seed_transform.times(Mat4.translation(0,3.2,-15));
        this.seed_transform_list.push(this.seed_transform);
        this.seed_list.push(arrayColumn(this.seed_transform,3));
        this.seed_transform = this.seed_transform.times(Mat4.translation(-10.4,-6,0));
        this.seed_transform_list.push(this.seed_transform);
        this.seed_list.push(arrayColumn(this.seed_transform,3));
        //draw the seed if it haven't been hit by the bird
        for (let i = 0; i < this.seed_keep_list.length; i++){
            let a = this.seed_transform_list[this.seed_keep_list[i]];
            this.shapes.seed.draw(context, program_state, a, this.materials.seed_texture);
        }
            


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
            this.displaypath(context,program_state,cannon_transform,rotationXMat,rotationYMat)
            // Custom Bird model
            // red body
            this.bird_transform = bird_startingPosition.times(birdscale);
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture);
            // white belly
            this.bird_transform = this.bird_transform.times(Mat4.translation(0, -0.07, -0.07)).times(Mat4.scale(0.9, 1, 0.9));
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
            this.bird_transform = bird_startingPosition;
            this.bird_transform = this.bird_transform.times(Mat4.translation(-0.06, 0, -0.2)).times(Mat4.scale(0.12, 0.12, 0.11));
            // Left Eye
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
            this.bird_transform = this.bird_transform.times(Mat4.translation(-0.09, -0.37, -0.86)).times(Mat4.scale(0.14, 0.14, 0.14));
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
            this.bird_transform = bird_startingPosition;
            this.bird_transform = this.bird_transform.times(Mat4.translation(0.06, 0, -0.2)).times(Mat4.scale(0.12, 0.12, 0.11));
            // Right Eye
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
            this.bird_transform = this.bird_transform.times(Mat4.translation(0.09, -0.37, -0.86)).times(Mat4.scale(0.14, 0.14, 0.14));
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
            this.bird_transform = bird_startingPosition;
            // Eyebrows
            this.bird_transform = this.bird_transform.times(Mat4.translation(0, 0.1, -0.28)).times(Mat4.scale(0.2, 0.022, 0.022));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
            this.bird_transform = bird_startingPosition;
            // Hair On Top
            this.bird_transform = this.bird_transform.times(Mat4.translation(0, 0.29, 0)).times(Mat4.scale(0.022, 0.1, 0.022));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
            this.bird_transform = this.bird_transform.times(Mat4.rotation(0.3, 0.5, 1.3, 1)).times(Mat4.translation(-3, 0.5, 1));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
            this.bird_transform = this.bird_transform.times(Mat4.rotation(0.3, -0.5, -1.1, 1)).times(Mat4.translation(4.7, -1.5, 1));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
            this.bird_transform = bird_startingPosition;
            // New Beak
            let beak_rotate_1 = 103.4;
            this.bird_transform = this.bird_transform.times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(-beak_rotate_1, beak_rotate_1, -beak_rotate_1, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.1, 0.2, 0.11));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));
            let beak_rotate_2 = Math.PI * 3
            this.bird_transform = bird_startingPosition.times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(beak_rotate_2, beak_rotate_2, 0, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.2, 0.1, 0.11));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));
            let beak_rotate_3 = Math.PI * 12.929;
            this.bird_transform = bird_startingPosition.times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(beak_rotate_3, 0, beak_rotate_3, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.2, 0.1, 0.11));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));
            let beak_rotate_4 = Math.PI * 64.43;
            this.bird_transform = bird_startingPosition.times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(beak_rotate_4, 0, beak_rotate_4, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.11, 0.1, 0.2));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));

        }

        //if launchingiih/lauched change bird coords
        else
        {
            if(this.launchtime===0)
            {
                this.launchtime=t;
            }

            this.flytime+=dt;
            let tip_of_cannon = rotationYMat.times(rotationXMat.times(vec4(0,0,4,1)));

            //let rotate=Mat4.rotation(0,tip_of_cannon[0],tip_of_cannon[1],tip_of_cannon[2])
            //let translate= rotationYMat.times(shiftbackfromedge.times(Mat4.translation(0,ypos+2*Math.sin(this.rotationX),horizontal_position-2*Math.cos(this.rotationX))));

            let yintial=-tip_of_cannon[1];//2*Math.sin(this.rotationX);
            let xintial=-tip_of_cannon[0];//-2*Math.cos(this.rotationX)*Math.sin(this.rotationY);
            let zintial=-tip_of_cannon[2];//-2*Math.cos(this.rotationX)*Math.cos(this.rotationY);
            let intialHorizontalVelo=this.cannon_power*Math.cos(this.rotationX);
            let intialYVelo=this.cannon_power*Math.sin(this.rotationX);
            let ypos= yintial+intialYVelo*(t-this.launchtime)-4.9*(t-this.launchtime)*(t-this.launchtime);
            let horizontal_position=-(intialHorizontalVelo*(t-this.launchtime));
            let xpos= xintial+Math.sin(this.rotationY)*horizontal_position;
            let zpos= zintial+Math.cos(this.rotationY)*horizontal_position;

            let theta=Math.atan((intialYVelo-9.8*(t-this.launchtime))/intialHorizontalVelo);



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
            let bird_coord = projectile_translations.times(birdrotation.times(birdscale));
            
            this.bird_transform = projectile_translations.times(birdrotation.times(birdscale));
            this.bird_coord = bird_coord;
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture);
            // white belly

            this.bird_transform = this.bird_transform.times(Mat4.translation(0, -0.07, -0.07)).times(Mat4.scale(0.9, 1, 0.9));
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
            this.bird_transform = projectile_translations.times(birdrotation);
            this.bird_transform = this.bird_transform.times(Mat4.translation(-0.06, 0, -0.2)).times(Mat4.scale(0.12, 0.12, 0.11));

            // Left Eye
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
            this.bird_transform = this.bird_transform.times(Mat4.translation(-0.09, -0.37, -0.86)).times(Mat4.scale(0.14, 0.14, 0.14));
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
            this.bird_transform = projectile_translations.times(birdrotation);
            this.bird_transform = this.bird_transform.times(Mat4.translation(0.06, 0, -0.2)).times(Mat4.scale(0.12, 0.12, 0.11));

            // Right Eye
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("ffffff")}));
            this.bird_transform = this.bird_transform.times(Mat4.translation(0.09, -0.37, -0.86)).times(Mat4.scale(0.14, 0.14, 0.14));
            this.shapes.custom_bird.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
            this.bird_transform = projectile_translations.times(birdrotation);

            // Eyebrows
            this.bird_transform = this.bird_transform.times(Mat4.translation(0, 0.1, -0.28)).times(Mat4.scale(0.2, 0.022, 0.022));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("000000")}));
            this.bird_transform = projectile_translations.times(birdrotation);

            // Hair On Top
            this.bird_transform = this.bird_transform.times(Mat4.translation(0, 0.29, 0)).times(Mat4.scale(0.022, 0.1, 0.022));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
            this.bird_transform = this.bird_transform.times(Mat4.rotation(0.3, 0.5, 1.3, 1)).times(Mat4.translation(-3, 0.5, 1));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
            this.bird_transform = this.bird_transform.times(Mat4.rotation(0.3, -0.5, -1.1, 1)).times(Mat4.translation(4.7, -1.5, 1));
            this.shapes.box_1.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("d90404")}));
            this.bird_transform = projectile_translations.times(birdrotation);

            // New Beak
            let beak_rotate_1 = 103.4;
            this.bird_transform = this.bird_transform.times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(-beak_rotate_1, beak_rotate_1, -beak_rotate_1, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.1, 0.2, 0.11));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));

            let beak_rotate_2 = Math.PI * 3
            this.bird_transform = projectile_translations.times(birdrotation).times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(beak_rotate_2, beak_rotate_2, 0, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.2, 0.1, 0.11));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));

            let beak_rotate_3 = Math.PI * 12.929;
            this.bird_transform = projectile_translations.times(birdrotation).times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(beak_rotate_3, 0, beak_rotate_3, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.2, 0.1, 0.11));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));

            let beak_rotate_4 = Math.PI * 64.43;
            this.bird_transform = projectile_translations.times(birdrotation).times(Mat4.translation(0, -0.13, -0.25)).times(Mat4.rotation(beak_rotate_4, 0, beak_rotate_4, 1));
            this.bird_transform = this.bird_transform.times(Mat4.scale(0.11, 0.1, 0.2));
            this.shapes.tet.draw(context, program_state, this.bird_transform, this.materials.custom_bird_texture.override({color:hex_color("#fcba03")}));


            //check if collided with box
            //if haven't hit box yet
            if (!this.hit_box){
                for (let i = 0; i < this.box_list.length; i++){
                    if (this.collision(this.box_list[i], arrayColumn(bird_coord,3))){
                        for (let a = 0; a < this.box_keep_list.length; a++){
                            //remove the box number from keep list (keep list is for #number of assign box that not been hit by bird)
                            if (this.box_keep_list[a] == i){
                                this.box_keep_list.splice(a,1);
                            }
                        }
                        this.hit_box = true;
                        break;
                    }
                }
            }

            //check if collided with chocolate
            //if haven't hit anything yet
            if (!this.hit_chocolate){
                for (let i = 0; i < this.chocolate_list.length; i++){
                    if (this.collision(this.chocolate_list[i],arrayColumn(bird_coord, 3))){
                        this.hit_chocolate = true;
                    }
                }
            }

            //check if collided with seed
            //if haven't hit anything yet
            if (!this.hit_seed){
                for (let i = 0; i < this.seed_list.length; i++){
                    if (this.collision(this.seed_list[i],arrayColumn(bird_coord, 3))){
                        for (let a = 0; a < this.seed_keep_list.length; a++){
                            if (this.seed_keep_list[a] == i){
                                this.seed_keep_list.splice(a,1);
                            }
                        }
                        this.hit_seed = true;
                        this.food_count-=1;
                        break;
                    }
                }
            }
            
            
        }
        let desired = this.initial_camera_location;
        if(!this.reloaded && this.launch  && this.bird_coord != undefined && !this.game_over){
            desired = this.bird_coord;
            desired = Mat4.inverse(desired.times(Mat4.translation(0, 0, 5)));
        }
        let result_location = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.8));
        program_state.set_camera(result_location);

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
        let game_over_won = this.add_text.create_text(
            this.add_text.transformation_function([-3.4,0.4,-5],[0.5,0.5,1]), " You Win!"
        );

        let game_over_lost = this.add_text.create_text(
            this.add_text.transformation_function([-3.4,0.5,-5],[0.4,0.4,1]), "  You Lost!"
        );
        let game_over_bomb = this.add_text.create_text(
            this.add_text.transformation_function([-3.4,-0.1,-5],[0.2,0.2,1]), "    You hit the Bomb!"
        );
        let restart = this.add_text.create_text(
            this.add_text.transformation_function([-3.4,-0.5,-5],[0.15,0.15,1]), " Press \'m\' to Restart the game!"
        );

        if (this.remaining_bird <= 0){
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
        if(this.hit_chocolate){
            game_over_bomb["shape"].set_string(game_over_bomb.text, context.context);
            game_over_bomb["shape"].draw(context,program_state,game_over_bomb["transform"](program_state.camera_inverse),game_over_bomb["material"]);
            game_over_lost["shape"].set_string(game_over_lost.text, context.context);
            game_over_lost["shape"].draw(context,program_state,game_over_lost["transform"](program_state.camera_inverse),game_over_lost["material"]);
            restart["shape"].set_string(restart.text, context.context);
            restart["shape"].draw(context,program_state,restart["transform"](program_state.camera_inverse),restart["material"]);
            this.game_over = true;
        }

        else if(this.food_count <= 0){
            game_over_won["shape"].set_string(game_over_won.text, context.context);
            game_over_won["shape"].draw(context,program_state,game_over_won["transform"](program_state.camera_inverse),game_over_won["material"]);
            restart["shape"].set_string(restart.text, context.context);
            restart["shape"].draw(context,program_state,restart["transform"](program_state.camera_inverse),restart["material"]);
            this.game_over = true;
        }
        else if (this.remaining_bird <= 0 && this.food_count > 0 && !this.moving){
            game_over_lost["shape"].set_string(game_over_lost.text, context.context);
            game_over_lost["shape"].draw(context,program_state,game_over_lost["transform"](program_state.camera_inverse),game_over_lost["material"]);
            restart["shape"].set_string(restart.text, context.context);
            restart["shape"].draw(context,program_state,restart["transform"](program_state.camera_inverse),restart["material"]);
            this.game_over = true;
        }
        
    }
}

export class add_text{
    constructor(parent){
        this.parent = parent;
        this.shapes = {
            text_shape: new Text_Line(100),
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
