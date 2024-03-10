import GUI from "lil-gui";
import _ from "underscore";

class Custom_GUI extends GUI{
    constructor(splineApp){
        super();
        this.hide();
        this._splineApp = splineApp;
        this.windowFixedToFloor = 15;
        this.windowFixedToCeil = 15;
        this.windowFixedToSide = 10;
        this.roomMinHeight = 230;
        this.walls = {
            length: 300,
            thickness: 5,
            height: 300,
            min: 230,
            max: 500,
            state:{
                rightWall: true,
                backWall: true,
                leftWall: false,
                frontWall: false,
            }
        }
        this.floor = {
            length : 300,
            width: 400,
            minLength: 200,
            maxLength: 1000,
            minWidth: 200,
            maxWidth: 1000,
        }
        this.windows = {
            rightWindow: "WWR",
            backWindow: "WWB",
            leftWindow: "WWL",
            frontWindow: "WWF",
            state:{
                rightWindow: false,
                backWindow: false,
                leftWindow: false,
                frontWindow: false,
            },
            width:100,
            hieght: 150,
            extrude: 2,
            min:50,
            maxWidth: 270,
            maxHeight: 269

        }
        this.cornice = {
            thickness: 1,
            height: 8,
            rightCornice: "CWR",
            backCornice: "CWB",
            leftCornice: "CWL",
            frontCornice: "CWF",
        }
        this.furnitures = {
            cube: "Cube",
            toilet: "Toilet",
            radiator: {
                name: "Radiator",
                thickness: 5.6,
                height: 96,
                width: 154
            }
        }
        this.doors = {
            backDoor : "DWB",
            width: 98,
            height: 209,
            thickness: 4
        }
        this.controllers = [];
    }

    init(app){

        let variables = app.getVariables();
        let filteredWalls = {};
        let controllers;
        
        /*v is the name of model in spline platform*/
        let walls = this.#findKey(variables,"wall");
        let floor = this.#findKey(variables,"floor");
        let windows = this.#findKey(variables,"windowFrame");
        let doors = this.#findKey(variables,"door");
        // console.log(windows);

        /*Create datas => floor*/
        if (!_.isEmpty(floor)){
            let floorFolder = this.addFolder("Floor");
            _.each(floor, m => {
                let name = _.keys(m)[0];
                if(name.includes("floorWidth")){
                    floorFolder.add( m, name, this.floor.minWidth, this.floor.maxWidth,10 ).onChange( value => {
                        app.setVariable(name,value);
                        this.#updateWalls(name,value);
                    });
                }else if (name.includes("floorLength")){
                    floorFolder.add( m, name, this.floor.minLength, this.floor.maxLength,10 ).onChange( value => {
                        app.setVariable(name,value);
                        this.#updateWalls(name,value);
                    }); 
                }
                // floorFolder.add( m, name, this.floor.minWdth, this.floor.maxWidth,10).onChange( value => {
                //     app.setVariable(name,value);
                //     this.#updateWalls(name,value);
                // })
            });
        }

        /*Create datas => walls*/
        if (!_.isEmpty(walls)){
            let wallFolder = this.addFolder("Walls");
            _.each(walls , w => _.extend(filteredWalls, w));
            let wallsVarArray = _.values(filteredWalls);
            let mainWalls = _.filter(wallsVarArray, m => _.isString(m) && m.includes("Wall"));
            _.each(mainWalls, m => {
                let data ={};
                let visibility;
                /*Set default visibility*/
                switch (m) {
                    case "Wall_Right":
                        visibility = this.walls.state.rightWall;
                        this.#getObjectByName(this.cornice.rightCornice).visible = visibility;
                        break;
                    case "Wall_Left":
                        visibility = this.walls.state.leftWall;
                        this.#getObjectByName(this.cornice.leftCornice).visible = visibility;
                        break;
                    case "Wall_Back":
                        visibility = this.walls.state.backWall;
                        this.#getObjectByName(this.cornice.backCornice).visible = visibility;
                        break;
                    case "Wall_Front":
                        visibility = this.walls.state.frontWall;
                        this.#getObjectByName(this.cornice.frontCornice).visible = visibility;
                        break;               
                    default:
                        visibility = true;
                        break;
                }
                data[m] = visibility;
                this.#getObjectByName(m).visible = visibility;
                
                wallFolder.add( data , m).onChange( value => {
                    this.#getObjectByName(m).visible = value;
                    /*Set Windows visibility*/
                    switch (m) {
                        case "Wall_Right":
                            this.walls.state.rightWall = value;
                            this.#findControllers("Window Right").disable(!value);
                            this.#findControllers("Panel Number WR").disable(!value);
                            if (this.windows.state.rightWindow) this.#getObjectByName("WWR").visible = value;
                            this.#getObjectByName(this.cornice.rightCornice).visible = value;
                            break;
                        case "Wall_Left":
                            this.walls.state.leftWall = value;
                            this.#findControllers("Window Left").disable(!value);
                            this.#findControllers("Panel Number WL").disable(!value);
                            if (this.windows.state.leftWindow) this.#getObjectByName("WWL").visible = value;
                            this.#getObjectByName(this.cornice.leftCornice).visible = value;
                            break;
                        case "Wall_Back":
                            this.walls.state.leftWall = value;
                            this.#findControllers("Window Back").disable(!value);
                            this.#findControllers("Panel Number WB").disable(!value);
                            if (this.windows.state.backWindow) this.#getObjectByName("WWB").visible = value;
                            this.#getObjectByName(this.cornice.backCornice).visible = value;
                            break;
                        case "Wall_Front":
                            this.walls.state.leftWall = value;
                            this.#findControllers("Window Front").disable(!value);
                            this.#findControllers("Panel Number WF").disable(!value);
                            if (this.windows.state.frontWindow) this.#getObjectByName("WWF").visible = value;
                            this.#getObjectByName(this.cornice.frontCornice).visible = value;
                            break;               
                        default:
                            visibility = true;
                            break;
                    }
                });
            });
            /*Wall height*/
            let wallsHight = app.getVariable("wallsHeight");
            wallFolder.add( {wallsHeight: wallsHight} , "wallsHeight",this.walls.min,this.walls.max,10).onChange( value => {
                app.setVariable("wallsHeight",value);
                this.#updateWalls("wallsHeight",value);
            });
        }

        /*Create datas => windows*/
        if (!_.isEmpty(windows)){
            // console.log(this.getEventData(this.windows.rightWindow,"DragDrop","limits"));
            // console.log(this.getEventData(this.windows.backWindow,"DragDrop","limits"));
            let windowsFolder = this.addFolder("Windows");
            //For Right window
            this.#getObjectByName(this.windows.rightWindow).visible = false;
            let WWR_xMin = -((this.floor.length -app.getVariable("windowFrameWidth_WWR"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWR_xMax = ((this.floor.length -app.getVariable("windowFrameWidth_WWR"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWR_yMin = app.getVariable("windowFrameHeight_WWR")/2 + this.windowFixedToFloor;
            let WWR_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWR")/2); 
            let WWR_zMin = -Infinity;
            let WWR_zMax = Infinity;

            this.#setDragDropLimits(this.windows.rightWindow,"DragDrop","limits",WWR_xMin , WWR_xMax , WWR_yMin , WWR_yMax , WWR_zMin , WWR_zMax);
            this.#getObjectByName("WWR_MF").visible = false;
            this.#getObjectByName("WWR_MLF").visible = false;
            this.#getObjectByName("WWR_MRF").visible = false;
            windowsFolder.add( {"Window Right" : false} , "Window Right").onChange( value => {
                this.#getObjectByName(this.windows.rightWindow).visible = value;
                this.windows.state.rightWindow = value;
            }).disable(!this.walls.state.rightWall);
            windowsFolder.add( {"Panel Number WR" : 1} , "Panel Number WR", [1,2,3,4]).onChange( value => {
                switch (value) {
                    case 1:
                        this.#getObjectByName("WWR_MF").visible = false;
                        this.#getObjectByName("WWR_MLF").visible = false;
                        this.#getObjectByName("WWR_MRF").visible = false;
                        break;
                    case 2:
                        this.#getObjectByName("WWR_MF").visible = true;
                        this.#getObjectByName("WWR_MLF").visible = false;
                        this.#getObjectByName("WWR_MRF").visible = false;
                        break;  
                    case 3:
                        this.#getObjectByName("WWR_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWR_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWR_MF").visible = false;
                        this.#getObjectByName("WWR_MLF").visible = true;
                        this.#getObjectByName("WWR_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWR_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWR_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWR_MF").visible = true;
                        this.#getObjectByName("WWR_MLF").visible = true;
                        this.#getObjectByName("WWR_MRF").visible = true;
                        break;               
                    default:
                        this.#getObjectByName("WWR_MF").visible = false;
                        this.#getObjectByName("WWR_MLF").visible = false;
                        this.#getObjectByName("WWR_MRF").visible = false;
                        break;
                }
                
            }).disable(!this.walls.state.rightWall);
            //For Back window
            this.#getObjectByName(this.windows.backWindow).visible = false;
            let WWB_zMin = -((this.floor.width -app.getVariable("windowFrameWidth_WWB"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWB_zMax = ((this.floor.width -app.getVariable("windowFrameWidth_WWB"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWB_yMin = app.getVariable("windowFrameHeight_WWB")/2 + this.windowFixedToFloor;
            let WWB_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWB")/2); 
            let WWB_xMin = -Infinity;
            let WWB_xMax = Infinity;

            this.#setDragDropLimits(this.windows.backWindow,"DragDrop","limits",WWB_xMin , WWB_xMax , WWB_yMin , WWB_yMax , WWB_zMin , WWB_zMax);
            this.#getObjectByName("WWB_MF").visible = false;
            this.#getObjectByName("WWB_MLF").visible = false;
            this.#getObjectByName("WWB_MRF").visible = false;
            windowsFolder.add( {"Window Back" : false} , "Window Back").onChange( value => {
                this.#getObjectByName(this.windows.backWindow).visible = value;
                this.windows.state.backWindow = value;
            }).disable(!this.walls.state.backWall);
            windowsFolder.add( {"Panel Number WB" : 1} , "Panel Number WB", [1,2,3,4]).onChange( value => {
                switch (value) {
                    case 1:
                        this.#getObjectByName("WWB_MF").visible = false;
                        this.#getObjectByName("WWB_MLF").visible = false;
                        this.#getObjectByName("WWB_MRF").visible = false;
                        break;
                    case 2:
                        this.#getObjectByName("WWB_MF").visible = true;
                        this.#getObjectByName("WWB_MLF").visible = false;
                        this.#getObjectByName("WWB_MRF").visible = false;
                        break;  
                    case 3:
                        this.#getObjectByName("WWB_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWB_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWB_MF").visible = false;
                        this.#getObjectByName("WWB_MLF").visible = true;
                        this.#getObjectByName("WWB_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWB_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWB_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWB_MF").visible = true;
                        this.#getObjectByName("WWB_MLF").visible = true;
                        this.#getObjectByName("WWB_MRF").visible = true;
                        break;               
                    default:
                        this.#getObjectByName("WWB_MF").visible = false;
                        this.#getObjectByName("WWB_MLF").visible = false;
                        this.#getObjectByName("WWB_MRF").visible = false;
                        break;
                }
                
            }).disable(!this.walls.state.backWall);
            //For Left window
            this.#getObjectByName(this.windows.leftWindow).visible = false;
            let WWL_xMin = -((this.floor.length -app.getVariable("windowFrameWidth_WWL"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWL_xMax = ((this.floor.length -app.getVariable("windowFrameWidth_WWL"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWL_yMin = app.getVariable("windowFrameHeight_WWL")/2 + this.windowFixedToFloor;
            let WWL_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWL")/2); 
            let WWL_zMin = -Infinity;
            let WWL_zMax = Infinity;

            this.#setDragDropLimits(this.windows.leftWindow,"DragDrop","limits",WWL_xMin , WWL_xMax , WWL_yMin , WWL_yMax , WWL_zMin , WWL_zMax);
            this.#getObjectByName("WWL_MF").visible = false;
            this.#getObjectByName("WWL_MLF").visible = false;
            this.#getObjectByName("WWL_MRF").visible = false;
            windowsFolder.add( {"Window Left" : false} , "Window Left").onChange( value => {
                this.#getObjectByName(this.windows.leftWindow).visible = value;
                this.windows.state.leftWindow = value;
            }).disable(!this.walls.state.leftWall);
            windowsFolder.add( {"Panel Number WL" : 1} , "Panel Number WL", [1,2,3,4]).onChange( value => {
                switch (value) {
                    case 1:
                        this.#getObjectByName("WWL_MF").visible = false;
                        this.#getObjectByName("WWL_MLF").visible = false;
                        this.#getObjectByName("WWL_MRF").visible = false;
                        break;
                    case 2:
                        this.#getObjectByName("WWL_MF").visible = true;
                        this.#getObjectByName("WWL_MLF").visible = false;
                        this.#getObjectByName("WWL_MRF").visible = false;
                        break;  
                    case 3:
                        this.#getObjectByName("WWL_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWL_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWL_MF").visible = false;
                        this.#getObjectByName("WWL_MLF").visible = true;
                        this.#getObjectByName("WWL_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWL_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWL_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWL_MF").visible = true;
                        this.#getObjectByName("WWL_MLF").visible = true;
                        this.#getObjectByName("WWL_MRF").visible = true;
                        break;               
                    default:
                        this.#getObjectByName("WWL_MF").visible = false;
                        this.#getObjectByName("WWL_MLF").visible = false;
                        this.#getObjectByName("WWL_MRF").visible = false;
                        break;
                }
                
            }).disable(!this.walls.state.leftWall);
            //For Fornt window
            this.#getObjectByName(this.windows.frontWindow).visible = false;
            let WWF_zMin = -((this.floor.width -app.getVariable("windowFrameWidth_WWF"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWF_zMax = ((this.floor.width -app.getVariable("windowFrameWidth_WWF"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWF_yMin = app.getVariable("windowFrameHeight_WWF")/2 + this.windowFixedToFloor;
            let WWF_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWF")/2); 
            let WWF_xMin = -Infinity;
            let WWF_xMax = Infinity;

            this.#setDragDropLimits(this.windows.frontWindow,"DragDrop","limits",WWF_xMin , WWF_xMax , WWF_yMin , WWF_yMax , WWF_zMin , WWF_zMax);
            this.#getObjectByName("WWF_MF").visible = false;
            this.#getObjectByName("WWF_MLF").visible = false;
            this.#getObjectByName("WWF_MRF").visible = false;
            windowsFolder.add( {"Window Front" : false} , "Window Front").onChange( value => {
                this.#getObjectByName(this.windows.frontWindow).visible = value;
                this.windows.state.frontWindow = value;
            }).disable(!this.walls.state.frontWall);
            windowsFolder.add( {"Panel Number WF" : 1} , "Panel Number WF", [1,2,3,4]).onChange( value => {
                switch (value) {
                    case 1:
                        this.#getObjectByName("WWF_MF").visible = false;
                        this.#getObjectByName("WWF_MLF").visible = false;
                        this.#getObjectByName("WWF_MRF").visible = false;
                        break;
                    case 2:
                        this.#getObjectByName("WWF_MF").visible = true;
                        this.#getObjectByName("WWF_MLF").visible = false;
                        this.#getObjectByName("WWF_MRF").visible = false;
                        break;  
                    case 3:
                        this.#getObjectByName("WWF_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWF_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/3;
                        this.#getObjectByName("WWF_MF").visible = false;
                        this.#getObjectByName("WWF_MLF").visible = true;
                        this.#getObjectByName("WWF_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWF_MLF").position.z = (this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWF_MRF").position.z = -(this.windows.width/2 - this.windows.extrude/2)/2;
                        this.#getObjectByName("WWF_MF").visible = true;
                        this.#getObjectByName("WWF_MLF").visible = true;
                        this.#getObjectByName("WWF_MRF").visible = true;
                        break;               
                    default:
                        this.#getObjectByName("WWF_MF").visible = false;
                        this.#getObjectByName("WWF_MLF").visible = false;
                        this.#getObjectByName("WWF_MRF").visible = false;
                        break;
                }
                
            }).disable(!this.walls.state.frontWall);
            _.each(windows, m => {
                let parameterName = _.keys(m)[0];
                let initialValue = _.values(m)[0];
                // console.log(initialValue)
                if(parameterName.includes("windowFrameWidth")){
                    windowsFolder.add( m, parameterName, this.windows.min, this.windows.maxWidth,10 ).onChange( value => {
                        this.#updateWindows(parameterName,value);
                    });
                }else if (parameterName.includes("windowFrameHeight")){
                    windowsFolder.add( m, parameterName, this.windows.min, this.windows.maxHeight,10 ).onChange( value => {
                        this.#updateWindows(parameterName,value);
                    }); 
                }

            });
        }

        /*Create datas => Doors*/
        if (!_.isEmpty(doors)){
            this.#setDragDropLimits(this.doors.backDoor,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness - this.doors.thickness),(this.floor.length/2 - this.walls.thickness - this.doors.thickness),(this.doors.height/2),(this.doors.height/2 + 0.1),-(this.floor.width/2 - this.walls.thickness),(this.floor.width/2 - this.walls.thickness));
            let doorsFolder = this.addFolder("Doors");
            //For Back Door
            this.#getObjectByName(this.doors.backDoor).visible = false;
            doorsFolder.add( {"Door Back" : false} , "Door Back").onChange( value => {
                this.#getObjectByName(this.doors.backDoor).visible = value;
            });
        }

        /*Create datas => Furnitures*/
        // this.#setDragDropLimits(this.furnitures.radiator,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness - this.doors.thickness),(this.floor.length/2 - this.walls.thickness - this.doors.thickness),(this.doors.height/2),(this.doors.height/2 + 0.1),-(this.floor.width/2 - this.walls.thickness),(this.floor.width/2 - this.walls.thickness));
        // let doorsFolder = this.addFolder("Doors");
        // //For Back Door
        // this.#getObjectByName(this.doors.backDoor).visible = false;
        // doorsFolder.add( {"Door Back" : false} , "Door Back").onChange( value => {
        //     this.#getObjectByName(this.doors.backDoor).visible = value;
        // });
        
        // console.log(app.findObjectByName("Window"))
        
        this.show(); 
        
        // this.controllers = this.controllersRecursive();
        // console.log(this.controllersRecursive());
    }

    #updateWalls(parameter,value){

        let windowThickness = this._splineApp.getVariable("windowExtrude");
        /*the followinf value should be multiply with scale, because WWR is
        a group or component object and Spline couldn't handle size automaticaly
        so we change scale eachtime in update function. thus we multiply
        width with  scale each time!*/
        let windowFrameWidthWWR = this._splineApp.getVariable("windowFrameWidth_WWR") * this.#getObjectByName(this.windows.rightWindow).scale.z;
        let windowFrameHeightWWR = this._splineApp.getVariable("windowFrameHeight_WWR") * this.#getObjectByName(this.windows.rightWindow).scale.y;
        let windowFrameWidthWWL = this._splineApp.getVariable("windowFrameWidth_WWL") * this.#getObjectByName(this.windows.leftWindow).scale.z;
        let windowFrameHeightWWL = this._splineApp.getVariable("windowFrameHeight_WWL") * this.#getObjectByName(this.windows.leftWindow).scale.y;
        /*since we use rotate.y= 90 to make window for back and front
        walls, yet we should scale x, since scale function in spline opperate
        over main position! */
        let windowFrameWidthWWB = this._splineApp.getVariable("windowFrameWidth_WWB") * this.#getObjectByName(this.windows.backWindow).scale.z;
        let windowFrameHeightWWB = this._splineApp.getVariable("windowFrameHeight_WWB") * this.#getObjectByName(this.windows.backWindow).scale.y;
        let windowFrameWidthWWF = this._splineApp.getVariable("windowFrameWidth_WWF") * this.#getObjectByName(this.windows.frontWindow).scale.z;
        let windowFrameHeightWWF = this._splineApp.getVariable("windowFrameHeight_WWF") * this.#getObjectByName(this.windows.frontWindow).scale.y;

        let limits_WWR =  this.getEventData(this.windows.rightWindow,"DragDrop","limits");
        let limits_WWB =  this.getEventData(this.windows.backWindow,"DragDrop","limits");
        let limits_WWL =  this.getEventData(this.windows.leftWindow,"DragDrop","limits");
        let limits_WWF =  this.getEventData(this.windows.frontWindow,"DragDrop","limits");

        let limits_DWB =  this.getEventData(this.doors.backDoor,"DragDrop","limits");
        // this._splineApp._resize();
        // console.log(limits_DWB);
        switch (parameter) {
            case "floorWidth":
                this.floor.width = value;
                this.#findControllers("windowFrameWidth_WWB").max(this.floor.width - 2 * this.walls.thickness - 2 * this.windowFixedToSide - 1);
                this.#findControllers("windowFrameWidth_WWB").updateDisplay();
                this.#findControllers("windowFrameWidth_WWF").max(this.floor.width - 2 * this.walls.thickness - 2 * this.windowFixedToSide - 1);
                this.#findControllers("windowFrameWidth_WWF").updateDisplay();
                //Walls
                this._splineApp.setVariable("wallLeftPosition_Z",value/2 - this.walls.thickness/2);
                this._splineApp.setVariable("wallRightPosition_Z",-(value/2 - this.walls.thickness/2));
                //Windows
                /*On Right Wall*/
                this.#getObjectByName(this.windows.rightWindow).position.z = -(value/2 - this.walls.thickness- windowThickness/2);
                /*On Back Wall*/
                this.#setDragDropLimits(this.windows.backWindow,"DragDrop","limits",-Infinity,Infinity,limits_WWB[2],limits_WWB[3],-(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWB_releativeZ_Pos = this._splineApp.findObjectByName(this.windows.backWindow).position.z > (value/2 - windowFrameWidthWWB/2 - this.windowFixedToSide);
                if(WWB_releativeZ_Pos){
                    this.#getObjectByName(this.windows.backWindow).position.z = (value/2 - windowFrameWidthWWB/2 - this.windowFixedToSide);
                }
                let WWB_releativeZ_Neg = this.#getObjectByName(this.windows.backWindow).position.z < -(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWB_releativeZ_Neg){
                    this.#getObjectByName(this.windows.backWindow).position.z = -(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide);
                }
                /*On Left Wall*/
                this.#getObjectByName(this.windows.leftWindow).position.z = (value/2 - this.walls.thickness- windowThickness/2);
                /*On Front Wall*/
                this.#setDragDropLimits(this.windows.frontWindow,"DragDrop","limits",-Infinity,Infinity,limits_WWF[2],limits_WWF[3],-(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWF_releativeZ_Pos = this._splineApp.findObjectByName(this.windows.frontWindow).position.z > (value/2 - windowFrameWidthWWF/2 - this.windowFixedToSide);
                if(WWF_releativeZ_Pos){
                    this.#getObjectByName(this.windows.frontWindow).position.z = (value/2 - windowFrameWidthWWF/2 - this.windowFixedToSide);
                }
                let WWF_releativeZ_Neg = this.#getObjectByName(this.windows.frontWindow).position.z < -(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWF_releativeZ_Neg){
                    this.#getObjectByName(this.windows.frontWindow).position.z = -(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide);
                }
                //Cornice
                this.#getObjectByName(this.cornice.rightCornice).position.z = -(value/2 - this.walls.thickness - this.cornice.thickness/2);
                this.#getObjectByName(this.cornice.leftCornice).position.z = (value/2 - this.walls.thickness - this.cornice.thickness/2)
                this._splineApp.setVariable("corniceLengthFB",value - 0.5);

                //Door
                this.#setDragDropLimits(this.doors.backDoor,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness),(this.floor.length/2 - this.walls.thickness),limits_DWB[2],limits_DWB[3],-(value/2 - this.walls.thickness),(value/2 - this.walls.thickness));
                break;
            case "floorLength":
                this.floor.length = value;
                this.#findControllers("windowFrameWidth_WWR").max(this.floor.length - 2 * this.walls.thickness - 2 * this.windowFixedToSide - 1);
                this.#findControllers("windowFrameWidth_WWR").updateDisplay();
                this.#findControllers("windowFrameWidth_WWL").max(this.floor.length - 2 * this.walls.thickness - 2 * this.windowFixedToSide - 1);
                this.#findControllers("windowFrameWidth_WWL").updateDisplay();
                //Walls
                this._splineApp.setVariable("wallFrontPosition_X",value/2 - this.walls.thickness/2);
                this._splineApp.setVariable("wallBackPosition_X",-(value/2 - this.walls.thickness/2));
                //Windows
                /*On Right Wall*/
                this.#setDragDropLimits(this.windows.rightWindow,"DragDrop","limits",-(value/2 - windowFrameWidthWWR/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWR/2 - this.windowFixedToSide),limits_WWR[2],limits_WWR[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWR_releativeX_Pos = this._splineApp.findObjectByName(this.windows.rightWindow).position.x > (value/2 - windowFrameWidthWWR/2 - this.windowFixedToSide);
                if(WWR_releativeX_Pos){
                    this.#getObjectByName(this.windows.rightWindow).position.x = (value/2 - windowFrameWidthWWR/2 - this.windowFixedToSide);
                }
                let WWR_releativeX_Neg = this.#getObjectByName(this.windows.rightWindow).position.x < -(value/2 - windowFrameWidthWWR/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWR_releativeX_Neg){
                    this.#getObjectByName(this.windows.rightWindow).position.x = -(value/2 - windowFrameWidthWWR/2 - this.walls.thickness - this.windowFixedToSide);
                }
                /*On Back Wall*/
                this.#getObjectByName(this.windows.backWindow).position.x = -(value/2 - this.walls.thickness- windowThickness/2);
                /*On Left Wall*/
                this.#setDragDropLimits(this.windows.leftWindow,"DragDrop","limits",-(value/2 - windowFrameWidthWWL/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWL/2 - this.windowFixedToSide),limits_WWL[2],limits_WWL[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWL_releativeX_Pos = this._splineApp.findObjectByName(this.windows.leftWindow).position.x > (value/2 - windowFrameWidthWWL/2 - this.windowFixedToSide);
                if(WWL_releativeX_Pos){
                    this.#getObjectByName(this.windows.leftWindow).position.x = (value/2 - windowFrameWidthWWL/2 - this.windowFixedToSide);
                }
                let WWL_releativeX_Neg = this.#getObjectByName(this.windows.leftWindow).position.x < -(value/2 - windowFrameWidthWWL/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWL_releativeX_Neg){
                    this.#getObjectByName(this.windows.leftWindow).position.x = -(value/2 - windowFrameWidthWWL/2 - this.walls.thickness - this.windowFixedToSide);
                }
                /*On Front Wall*/
                this.#getObjectByName(this.windows.frontWindow).position.x = (value/2 - this.walls.thickness- windowThickness/2);
                //Cornice
                this.#getObjectByName(this.cornice.frontCornice).position.x = (value/2 - this.walls.thickness - this.cornice.thickness/2);
                this.#getObjectByName(this.cornice.backCornice).position.x = -(value/2 - this.walls.thickness - this.cornice.thickness/2)
                this._splineApp.setVariable("corniceLengthRL",value - 0.5);
                //Door
                this.#setDragDropLimits(this.doors.backDoor,"DragDrop","limits",-(value/2 - this.walls.thickness),(value/2 - this.walls.thickness),limits_DWB[2],limits_DWB[3],-(this.floor.width/2 - this.walls.thickness),(this.floor.width/2 - this.walls.thickness));
                break;      
            case "wallsHeight":
                this.walls.height = value;
                this.windows.maxHeight = value - this.windowFixedToCeil - this.windowFixedToFloor - 1;
                this.#findControllers("windowFrameHeight_WWR").max(this.windows.maxHeight);
                this.#findControllers("windowFrameHeight_WWR").updateDisplay();
                this.#findControllers("windowFrameHeight_WWL").max(this.windows.maxHeight);
                this.#findControllers("windowFrameHeight_WWL").updateDisplay();
                this.#findControllers("windowFrameHeight_WWB").max(this.windows.maxHeight);
                this.#findControllers("windowFrameHeight_WWB").updateDisplay();
                this.#findControllers("windowFrameHeight_WWF").max(this.windows.maxHeight);
                this.#findControllers("windowFrameHeight_WWF").updateDisplay();
                //Walls
                this._splineApp.setVariable("wallsPosition_Y",value / 2);
                //Windows
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                /*On Right Wall*/
                this.#setDragDropLimits(this.windows.rightWindow,"DragDrop","limits",limits_WWR[0],limits_WWR[1],(windowFrameHeightWWR/2 + this.windowFixedToFloor),(value - windowFrameHeightWWR/2 - this.windowFixedToCeil),-Infinity,Infinity);
                let WWR_releativeY_Pos = this.#getObjectByName(this.windows.rightWindow).position.y > (value - windowFrameHeightWWR/2 - this.windowFixedToCeil)
                if(WWR_releativeY_Pos){
                    this.#getObjectByName(this.windows.rightWindow).position.y = (value - windowFrameHeightWWR/2 - this.windowFixedToCeil);
                }
                let WWR_releativeY_Neg = this.#getObjectByName(this.windows.rightWindow).position.y < (windowFrameHeightWWR/2 + this.windowFixedToFloor)
                if(WWR_releativeY_Neg){
                    this.#getObjectByName(this.windows.rightWindow).position.y = (windowFrameHeightWWR/2 + this.windowFixedToFloor);
                }
                /*On Back Wall*/
                this.#setDragDropLimits(this.windows.backWindow,"DragDrop","limits",-Infinity,Infinity,(windowFrameHeightWWB/2 + this.windowFixedToFloor),(value - windowFrameHeightWWB/2 - this.windowFixedToCeil),limits_WWB[4],limits_WWB[5]);
                let WWB_releativeY_Pos = this.#getObjectByName(this.windows.backWindow).position.y > (value - windowFrameHeightWWB/2 - this.windowFixedToCeil)
                if(WWB_releativeY_Pos){
                    this.#getObjectByName(this.windows.backWindow).position.y = (value - windowFrameHeightWWB/2 - this.windowFixedToCeil);
                }
                let WWB_releativeY_Neg = this.#getObjectByName(this.windows.backWindow).position.y < (windowFrameHeightWWB/2 + this.windowFixedToFloor)
                if(WWB_releativeY_Neg){
                    this.#getObjectByName(this.windows.backWindow).position.y = (windowFrameHeightWWB/2 + this.windowFixedToFloor);
                }
                /*On Left Wall*/
                this.#setDragDropLimits(this.windows.leftWindow,"DragDrop","limits",limits_WWL[0],limits_WWL[1],(windowFrameHeightWWL/2 + this.windowFixedToFloor),(value - windowFrameHeightWWL/2 - this.windowFixedToCeil),-Infinity,Infinity);
                let WWL_releativeY_Pos = this.#getObjectByName(this.windows.leftWindow).position.y > (value - windowFrameHeightWWL/2 - this.windowFixedToCeil)
                if(WWL_releativeY_Pos){
                    this.#getObjectByName(this.windows.leftWindow).position.y = (value - windowFrameHeightWWL/2 - this.windowFixedToCeil);
                }
                let WWL_releativeY_Neg = this.#getObjectByName(this.windows.leftWindow).position.y < (windowFrameHeightWWL/2 + this.windowFixedToFloor)
                if(WWL_releativeY_Neg){
                    this.#getObjectByName(this.windows.leftWindow).position.y = (windowFrameHeightWWL/2 + this.windowFixedToFloor);
                }
                /*On Back Wall*/
                this.#setDragDropLimits(this.windows.frontWindow,"DragDrop","limits",-Infinity,Infinity,(windowFrameHeightWWF/2 + this.windowFixedToFloor),(value - windowFrameHeightWWF/2 - this.windowFixedToCeil),limits_WWF[4],limits_WWF[5]);
                let WWF_releativeY_Pos = this.#getObjectByName(this.windows.frontWindow).position.y > (value - windowFrameHeightWWF/2 - this.windowFixedToCeil)
                if(WWF_releativeY_Pos){
                    this.#getObjectByName(this.windows.frontWindow).position.y = (value - windowFrameHeightWWF/2 - this.windowFixedToCeil);
                }
                let WWF_releativeY_Neg = this.#getObjectByName(this.windows.frontWindow).position.y < (windowFrameHeightWWF/2 + this.windowFixedToFloor)
                if(WWF_releativeY_Neg){
                    this.#getObjectByName(this.windows.frontWindow).position.y = (windowFrameHeightWWF/2 + this.windowFixedToFloor);
                }
                // //Counters
                // this.#getObjectByName("Counters").position.y = value + 60;
                break; 
            default:
                break;
        }
    }

    #updateWindows(parameter,value){

        let windowFrameWidthWWR = this._splineApp.getVariable("windowFrameWidth_WWR");
        let windowFrameHeightWWR = this._splineApp.getVariable("windowFrameHeight_WWR");
        let windowFrameWidthWWB = this._splineApp.getVariable("windowFrameWidth_WWB");
        let windowFrameHeightWWB = this._splineApp.getVariable("windowFrameHeight_WWB");
        let windowFrameWidthWWL = this._splineApp.getVariable("windowFrameWidth_WWL");
        let windowFrameHeightWWL = this._splineApp.getVariable("windowFrameHeight_WWL");
        let windowFrameWidthWWF = this._splineApp.getVariable("windowFrameWidth_WWF");
        let windowFrameHeightWWF = this._splineApp.getVariable("windowFrameHeight_WWF");

        let limits_WWR =  this.getEventData(this.windows.rightWindow,"DragDrop","limits");
        let limits_WWB =  this.getEventData(this.windows.backWindow,"DragDrop","limits");
        let limits_WWL =  this.getEventData(this.windows.leftWindow,"DragDrop","limits");
        let limits_WWF =  this.getEventData(this.windows.frontWindow,"DragDrop","limits");

        switch (parameter) {
            /*Right Window*/
            case "windowFrameWidth_WWR":
                /*these update floor width controller*/
                this.floor.minWidth = Math.max(
                    this.#findControllers("windowFrameWidth_WWR").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWL").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    210
                );
                this.#findControllers("floorLength").min(this.floor.minWidth);
                this.#findControllers("floorLength").updateDisplay();
                let WWR_scaleX = (1 + (value - windowFrameWidthWWR)/windowFrameWidthWWR);
                this.#getObjectByName(this.windows.rightWindow).scale.z = WWR_scaleX;
                this.#setDragDropLimits(this.windows.rightWindow,"DragDrop","limits",-(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.length/2 - value/2 - this.windowFixedToSide),limits_WWR[2],limits_WWR[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWR_releativeX_Pos = this.#getObjectByName(this.windows.rightWindow).position.x > (this.floor.length/2 - value/2 - this.windowFixedToSide);
                if(WWR_releativeX_Pos){
                    this.#getObjectByName(this.windows.rightWindow).position.x = (this.floor.length/2 - value/2 - this.windowFixedToSide);
                }
                let WWR_releativeX_Neg = this.#getObjectByName(this.windows.rightWindow).position.x < -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWR_releativeX_Neg){
                    this.#getObjectByName(this.windows.rightWindow).position.x = -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;
            case "windowFrameHeight_WWR":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;
                let WWR_scaleY = (1 + (value - windowFrameHeightWWR)/windowFrameHeightWWR);
                this.#getObjectByName(this.windows.rightWindow).scale.y = WWR_scaleY;
                console.log(this.walls.height)
                this.#setDragDropLimits(this.windows.rightWindow,"DragDrop","limits",limits_WWR[0],limits_WWR[1],(value/2 + this.windowFixedToFloor),(this.walls.height - value/2 - this.windowFixedToCeil),-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWR_releativeY_Pos = this.#getObjectByName(this.windows.rightWindow).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWR_releativeY_Pos){
                    this.#getObjectByName(this.windows.rightWindow).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWR_releativeY_Neg = this.#getObjectByName(this.windows.rightWindow).position.y < (value/2 + this.windowFixedToFloor);
                if(WWR_releativeY_Neg){
                    this.#getObjectByName(this.windows.rightWindow).position.y = (value/2 + this.windowFixedToFloor);
                }
                break; 
            /*Back Window*/   
            case "windowFrameWidth_WWB": 
                /*these update floor length controller*/
                this.floor.minLength = Math.max(
                    this.#findControllers("windowFrameWidth_WWB").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWF").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    210
                );
                this.#findControllers("floorWidth").min(this.floor.minLength);
                this.#findControllers("floorWidth").updateDisplay();
                // this.floor.min = value + 2 * this.windowFixedToSide; 
                let WWB_scaleX = (1 + (value - windowFrameWidthWWB)/windowFrameWidthWWB);
                console.log(WWB_scaleX)
                this.#getObjectByName(this.windows.backWindow).scale.z = WWB_scaleX;
                this.#setDragDropLimits(this.windows.backWindow,"DragDrop","limits",-Infinity,Infinity,limits_WWB[2],limits_WWB[3],-(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.width/2 - value/2 - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWB_releativeZ_Pos = this.#getObjectByName(this.windows.backWindow).position.z > (this.floor.width/2 - value/2 - this.windowFixedToSide);
                if(WWB_releativeZ_Pos){
                    this.#getObjectByName(this.windows.backWindow).position.z = (this.floor.width/2 - value/2 - this.windowFixedToSide);
                }
                let WWB_releativeZ_Neg = this.#getObjectByName(this.windows.backWindow).position.z < -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWB_releativeZ_Neg){
                    this.#getObjectByName(this.windows.backWindow).position.z = -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;  
            case "windowFrameHeight_WWB":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;
                let WWB_scaleY = (1 + (value - windowFrameHeightWWB)/windowFrameHeightWWB);
                this.#getObjectByName(this.windows.backWindow).scale.y = WWB_scaleY;
                this.#setDragDropLimits(this.windows.backWindow,"DragDrop","limits",-Infinity,Infinity,(value/2 + this.windowFixedToFloor),(this.walls.min - value/2 - this.windowFixedToCeil),limits_WWB[4],limits_WWB[5]);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWB_releativeY_Pos = this.#getObjectByName(this.windows.backWindow).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWB_releativeY_Pos){
                    this.#getObjectByName(this.windows.backWindow).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWB_releativeY_Neg = this.#getObjectByName(this.windows.backWindow).position.y < (value/2 + this.windowFixedToFloor);
                if(WWB_releativeY_Neg){
                    this.#getObjectByName(this.windows.backWindow).position.y = (value/2 + this.windowFixedToFloor);
                }
                break;
            /*Left Window*/  
            case "windowFrameWidth_WWL":
                /*these update floor width controller*/
                this.floor.minWidth = Math.max(
                    this.#findControllers("windowFrameWidth_WWR").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWL").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    210
                );
                this.#findControllers("floorLength").min(this.floor.minWidth);
                this.#findControllers("floorLength").updateDisplay();
                let WWL_scaleX = (1 + (value - windowFrameWidthWWL)/windowFrameWidthWWL);
                this.#getObjectByName(this.windows.leftWindow).scale.z = WWL_scaleX;
                this.#setDragDropLimits(this.windows.leftWindow,"DragDrop","limits",-(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.length/2 - value/2 - this.windowFixedToSide),limits_WWL[2],limits_WWL[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWL_releativeX_Pos = this.#getObjectByName(this.windows.leftWindow).position.x > (this.floor.length/2 - value/2 - this.windowFixedToSide);
                if(WWL_releativeX_Pos){
                    this.#getObjectByName(this.windows.leftWindow).position.x = (this.floor.length/2 - value/2 - this.windowFixedToSide);
                }
                let WWL_releativeX_Neg = this.#getObjectByName(this.windows.leftWindow).position.x < -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWL_releativeX_Neg){
                    this.#getObjectByName(this.windows.leftWindow).position.x = -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;
            case "windowFrameHeight_WWL":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;
                let WWL_scaleY = (1 + (value - windowFrameHeightWWL)/windowFrameHeightWWL);
                this.#getObjectByName(this.windows.leftWindow).scale.y = WWL_scaleY;
                this.#setDragDropLimits(this.windows.leftWindow,"DragDrop","limits",limits_WWL[0],limits_WWL[1],(value/2 + this.windowFixedToFloor),(this.walls.min - value/2 - this.windowFixedToCeil),-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWL_releativeY_Pos = this.#getObjectByName(this.windows.leftWindow).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWL_releativeY_Pos){
                    this.#getObjectByName(this.windows.leftWindow).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWL_releativeY_Neg = this.#getObjectByName(this.windows.leftWindow).position.y < (value/2 + this.windowFixedToFloor);
                if(WWL_releativeY_Neg){
                    this.#getObjectByName(this.windows.leftWindow).position.y = (value/2 + this.windowFixedToFloor);
                }
                break; 
            /*Front Window*/   
            case "windowFrameWidth_WWF":  
                /*these update floor length controller*/
                this.floor.minLength = Math.max(
                    this.#findControllers("windowFrameWidth_WWB").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWF").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    210
                );
                this.#findControllers("floorWidth").min(this.floor.minLength);
                this.#findControllers("floorWidth").updateDisplay();
                let WWF_scaleX = (1 + (value - windowFrameWidthWWF)/windowFrameWidthWWF);
                this.#getObjectByName(this.windows.frontWindow).scale.z = WWF_scaleX;
                this.#setDragDropLimits(this.windows.frontWindow,"DragDrop","limits",-Infinity,Infinity,limits_WWF[2],limits_WWF[3],-(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.width/2 - value/2 - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWF_releativeZ_Pos = this.#getObjectByName(this.windows.frontWindow).position.z > (this.floor.width/2 - value/2 - this.windowFixedToSide);
                if(WWF_releativeZ_Pos){
                    this.#getObjectByName(this.windows.frontWindow).position.z = (this.floor.width/2 - value/2 - this.windowFixedToSide);
                }
                let WWF_releativeZ_Neg = this.#getObjectByName(this.windows.frontWindow).position.z < -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWF_releativeZ_Neg){
                    this.#getObjectByName(this.windows.frontWindow).position.z = -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;  
            case "windowFrameHeight_WWF":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + this.windows.hieght + 1,
                    // this.windowFixedToFloor + this.windowFixedToCeil + value + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;
                let WWF_scaleY = (1 + (value - windowFrameHeightWWF)/windowFrameHeightWWF);
                this.#getObjectByName(this.windows.frontWindow).scale.y = WWF_scaleY;
                this.#setDragDropLimits(this.windows.frontWindow,"DragDrop","limits",-Infinity,Infinity,(value/2 + this.windowFixedToFloor),(this.walls.min - value/2 - this.windowFixedToCeil),limits_WWF[4],limits_WWF[5]);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWF_releativeY_Pos = this.#getObjectByName(this.windows.frontWindow).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWF_releativeY_Pos){
                    this.#getObjectByName(this.windows.frontWindow).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWF_releativeY_Neg = this.#getObjectByName(this.windows.frontWindow).position.y < (value/2 + this.windowFixedToFloor);
                if(WWF_releativeY_Neg){
                    this.#getObjectByName(this.windows.frontWindow).position.y = (value/2 + this.windowFixedToFloor);
                }
                break; 
            case "windowFrameExtrude":
                break; 
            default:
                break;
        }

    }

    #findKey(variablesObject,...keywords){
        let keyList =  _.keys(variablesObject);
        let filteredKeys = [];

        _.each(keyList, key => {
            let member = {};
            if(_.some(keywords, kw => key.includes(kw))){
                member[key] = variablesObject[key];
                filteredKeys.push(member);
            }
        });
        return filteredKeys;
    }

    getEventData(objectName,eventName,eventParameter){
        let value = false;
        this._splineApp._scene.traverse( children => {
            if(children.name == objectName){
                // console.log(children.data.events);
                if(children.data.events && !_.isEmpty(children.data.events)){
                    // console.log(children.data.events);
                    let eventsCollection = children.data.events;
                    let targetEvent = _.filter(eventsCollection , e => e.data.type == eventName)
                    // console.log(targetEvent[0].data);
                    let eventData = targetEvent[0].data;
                    if (eventData[eventParameter]){
                        value = eventData[eventParameter];
                    }   
                }
            }
        });
        return value;
    }

    #setDragDropLimits(objectName,eventName,eventParameter,xMin,xMax,yMin,yMax,zMin,zMax){
        this._splineApp._scene.traverse( children => {
            if(children.name == objectName){
                // console.log(children.data.events);
                if(children.data.events && !_.isEmpty(children.data.events)){
                    // console.log(children.data.events);
                    let eventsCollection = children.data.events;
                    let targetEvent = _.filter(eventsCollection , e => e.data.type == eventName)
                    // console.log(targetEvent[0].data);
                    let eventData = targetEvent[0].data;  
                    if (eventData[eventParameter]){
                        eventData.limits[0] = xMin;
                        eventData.limits[1] = xMax;
                        eventData.limits[2] = yMin;
                        eventData.limits[3] = yMax;
                        eventData.limits[4] = zMin;
                        eventData.limits[5] = zMax;
                        // console.log( this.getEventData("Window","DragDrop","limits"));
                    } 
                }
            }
        });
    }

    #getObjectByName(name){
        if(this._splineApp.findObjectByName(name)){
            return this._splineApp.findObjectByName(name);
        }else{
            return {};
        }
    }

    #findControllers(name){
        let controllers = this.controllersRecursive();
        let controller
        // console.log(controllers)

        if (controllers) {
            controller = _.filter(controllers, c => c.property == name);
            // console.log(controller)
        }
        if(controller){
            return controller[0];
        }else{
            return {
                disable(a){console.log(a)}
            };
        }
    }
}


export {Custom_GUI}