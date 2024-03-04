import GUI from "lil-gui";
import _ from "underscore";


class Custom_GUI extends GUI{
    constructor(title,container ){
        super(title,container );
        this.hide();
        this.windowFixedToFloor = 15;
        this.windowFixedToCeil = 15;
        this.windowFixedToSide = 10;
    }

    objects(app){
        if (app){
            let objects = app.getAllObjects();
            
            _.each(objects, o => {
                let objectsFolder = this.addFolder(o.name).close();
                // objectsFolder.add( {"Name": o.name},"Name");
                // let box3 = new Box3().setFromObject(this._splineApp.findObjectByName(o.name));
                // let size = new Vector3();
                // box3.getSize(size);
                // console.log(size)
                objectsFolder.add( {"Visible": app.findObjectByName(o.name).visible},"Visible").onChange( val => {
                    app.findObjectByName(o.name).visible = val;
                });
                /*Position*/
                objectsFolder.add( {"Pos (x)": o.position.x},"Pos (x)",-1000,1000,1).onChange( val => {
                    o.position.x = val
                });
                objectsFolder.add( {"Pos (y)": o.position.y},"Pos (y)",-1000,1000,1).onChange( val => {
                    o.position.y = val
                });
                objectsFolder.add( {"Pos (z)": o.position.z},"Pos (z)",-1000,1000,1).onChange( val => {
                    o.position.z = val
                });
                /*Rotation*/
                objectsFolder.add( {"Rot (x)": o.rotation.x},"Rot (x)",-3.14,3.14,0.1).onChange( val => {
                    o.rotation.x = val
                });
                objectsFolder.add( {"Rot (y)": o.rotation.y},"Rot (y)",-3.14,3.14,0.1).onChange( val => {
                    o.rotation.y = val
                });
                objectsFolder.add( {"Rot (z)": o.rotation.z},"Rot (z)",-3.14,3.14,0.1).onChange( val => {
                    o.rotation.z = val
                });
                /*Scale*/
                objectsFolder.add( {"Scale (x)": o.scale.x},"Scale (x)",-2,2,0.1).onChange( val => {
                    o.scale.x = val
                });
                objectsFolder.add( {"Scale (y)": o.scale.y},"Scale (y)",-2,2,0.1).onChange( val => {
                    o.scale.y = val
                });
                objectsFolder.add( {"Scale (z)": o.scale.z},"Scale (z)",-2,2,0.1).onChange( val => {
                    o.scale.z = val
                });
            });
            
            // console.log(this._splineApp.findObjectByName("Window"))
            this.show(); 
        }

        return this;
    }

    variables(app){
        if (app){
            let variables = app.getVariables();
            let variablesName = _.keys(variables);
            let variablesValue = _.values(variables);
            console.log(variables);
            for (let i = 0; i < variablesName.length; i++) {
                this.add(variables,variablesName[i]).onChange( val => {
                    app.setVariable(variablesName[i], val);
                })
                
            }
            // _.each(variables, v => {
            //     console.log(v)
                
            // });
            this.close();
            this.show(); 
        }

        return this;
    }

}


export {Custom_GUI}