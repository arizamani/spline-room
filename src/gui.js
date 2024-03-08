import GUI from "lil-gui";
import _ from "underscore";

class Custom_GUI extends GUI{
    constructor(splineApp){
        super();
        this.hide();
        this._splineApp = splineApp;
        this.walls = {
            length: 300,
            thickness: 5,
            height: 300,
            min: 200,
            max: 500,
            state:{
                rightWall: true,
                backWall: true,
                leftWall: true,
                frontWall: true,
            }
        }
        this.floor = {
            length : 300,
            width: 400,
            min: 200,
            max: 1000
        }
        this.windowFixedToFloor = 15;
        this.windowFixedToCeil = 15;
        this.windowFixedToSide = 10;
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
            }
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
            toilet: "Toilet"
        }
        this.doors = {
            backDoor : "DWB"
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
                floorFolder.add( m, name, this.floor.min, this.floor.max,10).onChange( value => {
                    app.setVariable(name,value);
                    this.#updateWalls(name,value);
                })
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
                        visibility = this.#getObjectByName(m).visible;
                        this.#getObjectByName(this.cornice.rightCornice).visible = visibility;
                        break;
                    case "Wall_Left":
                        visibility = this.#getObjectByName(m).visible;
                        this.#getObjectByName(this.cornice.leftCornice).visible = visibility;
                        break;
                    case "Wall_Back":
                        visibility = this.#getObjectByName(m).visible;
                        this.#getObjectByName(this.cornice.backCornice).visible = visibility;
                        break;
                    case "Wall_Front":
                        visibility = this.#getObjectByName(m).visible;
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
                            if (this.windows.state.rightWindow) this.#getObjectByName("WWR").visible = value;
                            this.#getObjectByName(this.cornice.rightCornice).visible = value;
                            break;
                        case "Wall_Left":
                            this.walls.state.leftWall = value;
                            this.#findControllers("Window Left").disable(!value);
                            if (this.windows.state.leftWindow) this.#getObjectByName("WWL").visible = value;
                            this.#getObjectByName(this.cornice.leftCornice).visible = value;
                            break;
                        case "Wall_Back":
                            this.walls.state.leftWall = value;
                            this.#findControllers("Window Back").disable(!value);
                            if (this.windows.state.backWindow) this.#getObjectByName("WWB").visible = value;
                            this.#getObjectByName(this.cornice.backCornice).visible = value;
                            break;
                        case "Wall_Front":
                            this.walls.state.leftWall = value;
                            this.#findControllers("Window Front").disable(!value);
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
            wallFolder.add( {wallsHeight: wallsHight} , "wallsHeight",this.walls.min,this.walls.max).onChange( value => {
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
            // console.log(` 
            //     ${WWR_xMin} ,
            //     ${WWR_xMax} ,
            //     ${WWR_yMin} ,
            //     ${WWR_yMax} , 
            //     ${WWR_zMin} ,
            //     ${WWR_zMax} ,
            //     `)
            this.#setDragDropLimits(this.windows.rightWindow,"DragDrop","limits",WWR_xMin , WWR_xMax , WWR_yMin , WWR_yMax , WWR_zMin , WWR_zMax);
            windowsFolder.add( {"Window Right" : false} , "Window Right").onChange( value => {
                this.#getObjectByName(this.windows.rightWindow).visible = value;
                this.windows.state.rightWindow = value;
            });
            //For Back window
            this.#getObjectByName(this.windows.backWindow).visible = false;
            let WWB_zMin = -((this.floor.width -app.getVariable("windowFrameWidth_WWB"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWB_zMax = ((this.floor.width -app.getVariable("windowFrameWidth_WWB"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWB_yMin = app.getVariable("windowFrameHeight_WWB")/2 + this.windowFixedToFloor;
            let WWB_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWB")/2); 
            let WWB_xMin = -Infinity;
            let WWB_xMax = Infinity;

            this.#setDragDropLimits(this.windows.backWindow,"DragDrop","limits",WWB_xMin , WWB_xMax , WWB_yMin , WWB_yMax , WWB_zMin , WWB_zMax);
            windowsFolder.add( {"Window Back" : false} , "Window Back").onChange( value => {
                this.#getObjectByName(this.windows.backWindow).visible = value;
                this.windows.state.backWindow = value;
            });
            //For Left window
            this.#getObjectByName(this.windows.leftWindow).visible = false;
            let WWL_xMin = -((this.floor.length -app.getVariable("windowFrameWidth_WWL"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWL_xMax = ((this.floor.length -app.getVariable("windowFrameWidth_WWL"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWL_yMin = app.getVariable("windowFrameHeight_WWL")/2 + this.windowFixedToFloor;
            let WWL_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWL")/2); 
            let WWL_zMin = -Infinity;
            let WWL_zMax = Infinity;

            this.#setDragDropLimits(this.windows.leftWindow,"DragDrop","limits",WWL_xMin , WWL_xMax , WWL_yMin , WWL_yMax , WWL_zMin , WWL_zMax);
            windowsFolder.add( {"Window Left" : false} , "Window Left").onChange( value => {
                this.#getObjectByName(this.windows.leftWindow).visible = value;
                this.windows.state.leftWindow = value;
            });
            //For Fornt window
            this.#getObjectByName(this.windows.frontWindow).visible = false;
            let WWF_zMin = -((this.floor.width -app.getVariable("windowFrameWidth_WWF"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWF_zMax = ((this.floor.width -app.getVariable("windowFrameWidth_WWF"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWF_yMin = app.getVariable("windowFrameHeight_WWF")/2 + this.windowFixedToFloor;
            let WWF_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWF")/2); 
            let WWF_xMin = -Infinity;
            let WWF_xMax = Infinity;

            this.#setDragDropLimits(this.windows.frontWindow,"DragDrop","limits",WWF_xMin , WWF_xMax , WWF_yMin , WWF_yMax , WWF_zMin , WWF_zMax);
            windowsFolder.add( {"Window Front" : false} , "Window Front").onChange( value => {
                this.#getObjectByName(this.windows.frontWindow).visible = value;
                this.windows.state.frontWindow = value;
            });
            _.each(windows, m => {
                let parameterName = _.keys(m)[0];
                let initialValue = _.values(m)[0];
                console.log(initialValue)
                windowsFolder.add( m, parameterName, 80, 200,10 ).onChange( value => {
                    this.#updateWindows(parameterName,value);
                });
            });
        }

        /*Create datas => Doors*/
        // if (!_.isEmpty(doors)){
        //     let doorsFolder = this.addFolder("Doors");
        //     //For Back Door
        //     this.#getObjectByName(this.doors.backDoor).visible = false;
        //     doorsFolder.add( {"Door Back" : false} , "Door Back").onChange( value => {
        //         this.#getObjectByName(this.doors.backDoor).visible = value;
        //     });
        //     _.each(doors, m => {
        //         let parameterName = _.keys(m)[0];
        //         let initialValue = _.values(m)[0];
        //         doorsFolder.add( m, parameterName, 150, 230,10 ).onChange( value => {
        //             this.#updateWindows(parameterName,value);
        //         });

        //     });
        // }
        
        // console.log(app.findObjectByName("Window"))
        
        this.show(); 
        
        // this.controllers = this.controllersRecursive();
        // console.log(this.controllersRecursive());
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

    #updateWalls(parameter,value){

        let windowThickness = this._splineApp.getVariable("windowExtrude");
        /*the followinf value should be multiply with scale, because WWR is
        a group or component object and Spline couldn't handle size automaticaly
        so we change scale eachtime in update function. thus we multiply
        width with  scale each time!*/
        let windowFrameWidthWWR = this._splineApp.getVariable("windowFrameWidth_WWR") * this.#getObjectByName(this.windows.rightWindow).scale.x;
        let windowFrameHeightWWR = this._splineApp.getVariable("windowFrameHeight_WWR") * this.#getObjectByName(this.windows.rightWindow).scale.y;
        let windowFrameWidthWWL = this._splineApp.getVariable("windowFrameWidth_WWL") * this.#getObjectByName(this.windows.leftWindow).scale.x;
        let windowFrameHeightWWL = this._splineApp.getVariable("windowFrameHeight_WWL") * this.#getObjectByName(this.windows.leftWindow).scale.y;
        /*since we use rotate.y= 90 to make window for back and front
        walls, yet we should scale x, since scale function in spline opperate
        over main position! */
        let windowFrameWidthWWB = this._splineApp.getVariable("windowFrameWidth_WWB") * this.#getObjectByName(this.windows.backWindow).scale.x;
        let windowFrameHeightWWB = this._splineApp.getVariable("windowFrameHeight_WWB") * this.#getObjectByName(this.windows.backWindow).scale.y;
        let windowFrameWidthWWF = this._splineApp.getVariable("windowFrameWidth_WWF") * this.#getObjectByName(this.windows.frontWindow).scale.x;
        let windowFrameHeightWWF = this._splineApp.getVariable("windowFrameHeight_WWF") * this.#getObjectByName(this.windows.frontWindow).scale.y;

        let limits_WWR =  this.getEventData(this.windows.rightWindow,"DragDrop","limits");
        let limits_WWB =  this.getEventData(this.windows.backWindow,"DragDrop","limits");
        let limits_WWL =  this.getEventData(this.windows.leftWindow,"DragDrop","limits");
        let limits_WWF =  this.getEventData(this.windows.frontWindow,"DragDrop","limits");

        switch (parameter) {
            case "floorWidth":
                this.floor.width = value;
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
                break;
            case "floorLength":
                this.floor.length = value;
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
                
                break;      
            case "wallsHeight":
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
                let WWR_scaleX = (1 + (value - windowFrameWidthWWR)/windowFrameWidthWWR);
                this.#getObjectByName(this.windows.rightWindow).scale.x = WWR_scaleX;
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
                let WWR_scaleY = (1 + (value - windowFrameHeightWWR)/windowFrameHeightWWR);
                this.#getObjectByName(this.windows.rightWindow).scale.y = WWR_scaleY;
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
                let WWB_scaleX = (1 + (value - windowFrameWidthWWB)/windowFrameWidthWWB);
                this.#getObjectByName(this.windows.backWindow).scale.x = WWB_scaleX;
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
                let WWB_scaleY = (1 + (value - windowFrameHeightWWB)/windowFrameHeightWWB);
                this.#getObjectByName(this.windows.backWindow).scale.y = WWB_scaleY;
                this.#setDragDropLimits(this.windows.backWindow,"DragDrop","limits",-Infinity,Infinity,(value/2 + this.windowFixedToFloor),(this.walls.height - value/2 - this.windowFixedToCeil),limits_WWB[4],limits_WWB[5]);
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
                let WWL_scaleX = (1 + (value - windowFrameWidthWWL)/windowFrameWidthWWL);
                this.#getObjectByName(this.windows.leftWindow).scale.x = WWL_scaleX;
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
                let WWL_scaleY = (1 + (value - windowFrameHeightWWL)/windowFrameHeightWWL);
                this.#getObjectByName(this.windows.leftWindow).scale.y = WWL_scaleY;
                this.#setDragDropLimits(this.windows.leftWindow,"DragDrop","limits",limits_WWL[0],limits_WWL[1],(value/2 + this.windowFixedToFloor),(this.walls.height - value/2 - this.windowFixedToCeil),-Infinity,Infinity);
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
                let WWF_scaleX = (1 + (value - windowFrameWidthWWF)/windowFrameWidthWWF);
                this.#getObjectByName(this.windows.frontWindow).scale.x = WWF_scaleX;
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
                let WWF_scaleY = (1 + (value - windowFrameHeightWWF)/windowFrameHeightWWF);
                this.#getObjectByName(this.windows.frontWindow).scale.y = WWF_scaleY;
                this.#setDragDropLimits(this.windows.frontWindow,"DragDrop","limits",-Infinity,Infinity,(value/2 + this.windowFixedToFloor),(this.walls.height - value/2 - this.windowFixedToCeil),limits_WWF[4],limits_WWF[5]);
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