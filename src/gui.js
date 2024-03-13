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
                rightWall: false,
                backWall: true,
                leftWall: true,
                frontWall: false,
            },
            color:{
                cl1: 1,
                cl2: 2,
                cl3: 3,
                cl4: 4,
                cl5: 5
            }
        }
        this.floor = {
            length : 300,
            width: 400,
            minLength: 200,
            maxLength: 1000,
            minWidth: 200,
            maxWidth: 1000,
            color:{
                cl1: 1,
                cl2: 2,
                cl3: 3,
                cl4: 4,
                cl5: 5,
                cl6: 6,
                cl7: 7
            }
        }
        this.windows = {
            rightWindow: {
                name: "WWR",
                width:100,
                hieght: 150,
            },
            backWindow: {
                name: "WWB",
                width:100,
                hieght: 150,
            },
            leftWindow: {
                name: "WWL",
                width:100,
                hieght: 150,
            },
            frontWindow: {
                name: "WWF",
                width:100,
                hieght: 150,
            },
            state:{
                rightWindow: false,
                backWindow: false,
                leftWindow: false,
                frontWindow: false,
            },
            width:100,
            hieght: 150,
            extrudeWidth: 6,
            extrudeDepth: 2,
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
            radiator: {
                name: "Radiator",
                thickness: 5.6,
                height: 62.9,
                width: 154,
                state:{
                    visibility: true,
                }
                
            },
            table:{
                name: "Table Black",
                width: 90, //x
                length: 160, //z
                size:{
                    small: 1,
                    medium: 2,
                    large: 3
                },
                type:{
                    outlineCarbon: 1,
                    outline:2,
                    void:3,
                    sola:4
                },
                addon:{
                    cupHolder: {
                        none: 0,
                        type1: 1,
                        type2: 2,
                        type3: 3,
                        type4: 4
                    },
                    cableManagement:{
                        type1: 1
                    },
                    headsetHolder:{
                        type1: 1
                    },
                    mousepad:{
                        type1: 1
                    },
                    mug:{
                        type1: 1
                    },
                    keyoboard:{
                        type1: 1
                    },
                    mouse:{
                        type1: 1
                    },
                    headset:{
                        type1: 1
                    },
                    monitor:{
                        type1: 1
                    }
                },
                state:{
                    outlineCarbon: true,
                    outline:false,
                    void:false,
                    sola:false,
                    cupHolder1: false,
                    cupHolder2: false,
                    cupHolder3: false,
                    cupHolder4: false,
                    cableManagement1: false,
                    headsetHolder1: false,
                    mousepad1:false,
                    mug1:false,
                    keyboard1:false,
                    mouse1:false,
                    headset1:false,
                    monitor1:false,
                    visibility: true
                },
                color:{
                    white: 1,
                    black: 2
                },
            },
            sofa: {
                name: "Sofa",
                state:{
                    visibility: false,
                }  
            },
            chair: {
                name: "Chair",
                state:{
                    visibility: false,
                }  
            }
        }
        this.doors = {
            backDoor : "DWB",
            width: 98,
            height: 209,
            thickness: 4,
            state: {
                backDoor:{
                    close: {
                        x: 0,
                        z: -2.69,
                        rotationY: 0
                    },
                    open: {
                        x: 38,
                        z: 35,
                        rotationY: 1.57
                    },
                    visibility: true
                }
            },
        }

        this.controllers = [];
    }

    init(app){

        let variables = app.getVariables();
        let objects = app.getAllObjects();
        let filteredWalls = {};
        // console.log(this.#filterObjectsListByName(objects,"Btn","btn"));
        let uiControllers = this.#filterObjectsListByName(objects,"Btn","btn");
        _.each(uiControllers, m => this.#getObjectByName(m).visible = false);
        
        /*v is the name of model in spline platform*/
        let walls = this.#findKey(variables,"wall");
        let floor = this.#findKey(variables,"floor");
        let windows = this.#findKey(variables,"windowFrame");
        let doors = this.#findKey(variables,"door");

        // let doorlines = this.#findKey(objects,"Doorlines");
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
            });
            //Floor Color
            floorFolder.add( {"Color": 1} , "Color",this.floor.color).onChange( value => {
                switch (value) {
                    case 1:
                        app.emitEvent('mouseDown', 'Btn_FBaseCream');
                        break;
                    case 2:
                        app.emitEvent('mouseDown', 'Btn_FWood1');
                        break;
                    case 3:
                        app.emitEvent('mouseDown', 'Btn_FWood2');
                        break;
                    case 4:
                        app.emitEvent('mouseDown', 'Btn_FWood3');
                        break;
                    case 5:
                        app.emitEvent('mouseDown', 'Btn_FTile1');
                        break; 
                    case 6:
                        app.emitEvent('mouseDown', 'Btn_FGray1');
                        break; 
                    case 7:
                        app.emitEvent('mouseDown', 'Btn_FGray2');
                        break;               
                    default:
                        app.emitEvent('mouseDown', 'Btn_FBaseCream');
                        break;
                }
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
            //Wall height
            let wallsHight = app.getVariable("wallsHeight");
            wallFolder.add( {wallsHeight: wallsHight} , "wallsHeight",this.walls.min,this.walls.max,10).onChange( value => {
                app.setVariable("wallsHeight",value);
                this.#updateWalls("wallsHeight",value);
            });
            //Wall Color
            wallFolder.add( {"Color": 1} , "Color",this.walls.color).onChange( value => {
                switch (value) {
                    case 1:
                        app.emitEvent('mouseDown', 'Btn_WBaseWhite1');
                        break;
                    case 2:
                        app.emitEvent('mouseDown', 'Btn_WCream1');
                        break;
                    case 3:
                        app.emitEvent('mouseDown', 'Btn_WGray2');
                        break;
                    case 4:
                        app.emitEvent('mouseDown', 'Btn_WGray1');
                        break;
                    case 5:
                        app.emitEvent('mouseDown', 'Btn_WBlack1');
                        break;               
                    default:
                        app.emitEvent('mouseDown', 'Btn_WBaseWhite1');
                        break;
                }
            });
        }

        /*Create datas => windows*/
        if (!_.isEmpty(windows)){
            // console.log(this.getEventData(this.windows.rightWindow.name,"DragDrop","limits"));
            // console.log(this.getEventData(this.windows.backWindow.name,"DragDrop","limits"));
            let windowsFolder = this.addFolder("Windows");
            //For Right window
            this.#getObjectByName(this.windows.rightWindow.name).visible = this.windows.state.rightWindow;
            let WWR_xMin = -((this.floor.length -app.getVariable("windowFrameWidth_WWR"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWR_xMax = ((this.floor.length -app.getVariable("windowFrameWidth_WWR"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWR_yMin = app.getVariable("windowFrameHeight_WWR")/2 + this.windowFixedToFloor;
            let WWR_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWR")/2); 
            let WWR_zMin = -Infinity;
            let WWR_zMax = Infinity;

            this.#setDragDropLimits(this.windows.rightWindow.name,"DragDrop","limits",WWR_xMin , WWR_xMax , WWR_yMin , WWR_yMax , WWR_zMin , WWR_zMax);
            this.#getObjectByName("WWR_MF").visible = false;
            this.#getObjectByName("WWR_MLF").visible = false;
            this.#getObjectByName("WWR_MRF").visible = false;
            windowsFolder.add( {"Window Right" : this.windows.state.rightWindow} , "Window Right").onChange( value => {
                this.#getObjectByName(this.windows.rightWindow.name).visible = value;
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
                        this.#getObjectByName("WWR_MLF").position.z = (this.windows.rightWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWR_MRF").position.z = -(this.windows.rightWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWR_MF").visible = false;
                        this.#getObjectByName("WWR_MLF").visible = true;
                        this.#getObjectByName("WWR_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWR_MLF").position.z = (this.windows.rightWindow.width/2 - this.windows.extrudeWidth/2)/2;
                        this.#getObjectByName("WWR_MRF").position.z = -(this.windows.rightWindow.width/2 - this.windows.extrudeWidth/2)/2;
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
            this.#getObjectByName(this.windows.backWindow.name).visible = this.windows.state.backWindow;
            let WWB_zMin = -((this.floor.width -app.getVariable("windowFrameWidth_WWB"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWB_zMax = ((this.floor.width -app.getVariable("windowFrameWidth_WWB"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWB_yMin = app.getVariable("windowFrameHeight_WWB")/2 + this.windowFixedToFloor;
            let WWB_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWB")/2); 
            let WWB_xMin = -Infinity;
            let WWB_xMax = Infinity;

            this.#setDragDropLimits(this.windows.backWindow.name,"DragDrop","limits",WWB_xMin , WWB_xMax , WWB_yMin , WWB_yMax , WWB_zMin , WWB_zMax);
            this.#getObjectByName("WWB_MF").visible = false;
            this.#getObjectByName("WWB_MLF").visible = false;
            this.#getObjectByName("WWB_MRF").visible = false;
            windowsFolder.add( {"Window Back" : this.windows.state.backWindow} , "Window Back").onChange( value => {
                this.#getObjectByName(this.windows.backWindow.name).visible = value;
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
                        this.#getObjectByName("WWB_MLF").position.z = (this.windows.backWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWB_MRF").position.z = -(this.windows.backWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWB_MF").visible = false;
                        this.#getObjectByName("WWB_MLF").visible = true;
                        this.#getObjectByName("WWB_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWB_MLF").position.z = (this.windows.backWindow.width/2 - this.windows.extrudeWidth/2)/2;
                        this.#getObjectByName("WWB_MRF").position.z = -(this.windows.backWindow.width/2 - this.windows.extrudeWidth/2)/2;
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
            this.#getObjectByName(this.windows.leftWindow.name).visible = this.windows.state.leftWindow;
            let WWL_xMin = -((this.floor.length -app.getVariable("windowFrameWidth_WWL"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWL_xMax = ((this.floor.length -app.getVariable("windowFrameWidth_WWL"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWL_yMin = app.getVariable("windowFrameHeight_WWL")/2 + this.windowFixedToFloor;
            let WWL_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWL")/2); 
            let WWL_zMin = -Infinity;
            let WWL_zMax = Infinity;

            this.#setDragDropLimits(this.windows.leftWindow.name,"DragDrop","limits",WWL_xMin , WWL_xMax , WWL_yMin , WWL_yMax , WWL_zMin , WWL_zMax);
            this.#getObjectByName("WWL_MF").visible = false;
            this.#getObjectByName("WWL_MLF").visible = false;
            this.#getObjectByName("WWL_MRF").visible = false;
            windowsFolder.add( {"Window Left" : this.windows.state.leftWindow} , "Window Left").onChange( value => {
                this.#getObjectByName(this.windows.leftWindow.name).visible = value;
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
                        this.#getObjectByName("WWL_MLF").position.z = (this.windows.leftWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWL_MRF").position.z = -(this.windows.leftWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWL_MF").visible = false;
                        this.#getObjectByName("WWL_MLF").visible = true;
                        this.#getObjectByName("WWL_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWL_MLF").position.z = (this.windows.leftWindow.width/2 - this.windows.extrudeWidth/2)/2;
                        this.#getObjectByName("WWL_MRF").position.z = -(this.windows.leftWindow.width/2 - this.windows.extrudeWidth/2)/2;
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
            this.#getObjectByName(this.windows.frontWindow.name).visible = this.windows.state.frontWindow;
            let WWF_zMin = -((this.floor.width -app.getVariable("windowFrameWidth_WWF"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWF_zMax = ((this.floor.width -app.getVariable("windowFrameWidth_WWF"))/2 - (this.walls.thickness + this.windowFixedToSide));
            let WWF_yMin = app.getVariable("windowFrameHeight_WWF")/2 + this.windowFixedToFloor;
            let WWF_yMax = this.walls.height - (this.windowFixedToCeil + app.getVariable("windowFrameHeight_WWF")/2); 
            let WWF_xMin = -Infinity;
            let WWF_xMax = Infinity;

            this.#setDragDropLimits(this.windows.frontWindow.name,"DragDrop","limits",WWF_xMin , WWF_xMax , WWF_yMin , WWF_yMax , WWF_zMin , WWF_zMax);
            this.#getObjectByName("WWF_MF").visible = false;
            this.#getObjectByName("WWF_MLF").visible = false;
            this.#getObjectByName("WWF_MRF").visible = false;
            windowsFolder.add( {"Window Front" : this.windows.state.frontWindow} , "Window Front").onChange( value => {
                this.#getObjectByName(this.windows.frontWindow.name).visible = value;
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
                        this.#getObjectByName("WWF_MLF").position.z = (this.windows.frontWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWF_MRF").position.z = -(this.windows.frontWindow.width/2 - this.windows.extrudeWidth/2)/3;
                        this.#getObjectByName("WWF_MF").visible = false;
                        this.#getObjectByName("WWF_MLF").visible = true;
                        this.#getObjectByName("WWF_MRF").visible = true;
                        break; 
                    case 4:
                        this.#getObjectByName("WWF_MLF").position.z = (this.windows.frontWindow.width/2 - this.windows.extrudeWidth/2)/2;
                        this.#getObjectByName("WWF_MRF").position.z = -(this.windows.frontWindow.width/2 -this.windows.extrudeWidth/2)/2;
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
            let doorDimension = this.#calculateOBjectDimension(this.doors.backDoor);
            // this.#setDragDropLimits(this.doors.backDoor,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness - doorDimension.x/2),(this.floor.length/2 - this.walls.thickness -  doorDimension.x/2),(this.doors.height/2),(this.doors.height/2 + 0.1),-(this.floor.width/2 - this.walls.thickness -  doorDimension.z/2),(this.floor.width/2 - this.walls.thickness - doorDimension.z/2));
            let doorsFolder = this.addFolder("Doors");
            //For Back Door
            this.#getObjectByName(this.doors.backDoor).visible = this.doors.state.backDoor.visibility;
            doorsFolder.add( {"Door Back" : this.doors.state.backDoor.visibility} , "Door Back").onChange( value => {
                this.#getObjectByName(this.doors.backDoor).visible = value;
            });
            this.#getObjectByName("Doorlines").visible = false;
            this.#getObjectByName("Doorlines 2").visible = false;
            this.#getObjectByName("Doorlines 3").visible = false;
            this.#getObjectByName("Doorlines 4").visible = false;
            doorsFolder.add( {"Door Lines" : false} , "Door Lines").onChange( value => {
                this.#getObjectByName("Doorlines").visible = value;
                this.#getObjectByName("Doorlines 2").visible = value;
                this.#getObjectByName("Doorlines 3").visible = value;
                this.#getObjectByName("Doorlines 4").visible = value;
            });
            doorsFolder.add( {"Open" : false} , "Open").onChange( value => {
                if (value){
                    this.#getObjectByName("DoorMain").position.x = this.doors.state.backDoor.open.x;
                    this.#getObjectByName("DoorMain").position.z = this.doors.state.backDoor.open.z;
                    this.#getObjectByName("DoorMain").rotation.y = this.doors.state.backDoor.open.rotationY;
                }else{
                    this.#getObjectByName("DoorMain").position.x = this.doors.state.backDoor.close.x;
                    this.#getObjectByName("DoorMain").position.z = this.doors.state.backDoor.close.z;
                    this.#getObjectByName("DoorMain").rotation.y = this.doors.state.backDoor.close.rotationY;                   
                }
            });
        }

        /*Create datas => Furnitures*/
        this.#setDragDropLimits(this.furnitures.radiator.name,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness - this.furnitures.radiator.thickness),(this.floor.length/2 - this.walls.thickness - this.furnitures.radiator.thickness),(this.furnitures.radiator.height/2),(this.furnitures.radiator.height/2 + 0.1),-(this.floor.width/2 - this.walls.thickness),(this.floor.width/2 - this.walls.thickness));
        let furnituresFolder = this.addFolder("Furnitures");
        //For Radiator
        this.#getObjectByName(this.furnitures.radiator.name).visible = this.furnitures.radiator.state.visibility;
        furnituresFolder.add( {"Radiator" : this.furnitures.radiator.state.visibility} , "Radiator").onChange( value => {
            this.#getObjectByName(this.furnitures.radiator.name).visible = value;
        });
        //For Chair
        this.#getObjectByName(this.furnitures.chair.name).visible = this.furnitures.chair.state.visibility;
        furnituresFolder.add( {"Chair" : this.furnitures.chair.state.visibility} , "Chair").onChange( value => {
            this.#getObjectByName(this.furnitures.chair.name).visible = value;
        });
        //For Sofa
        this.#getObjectByName(this.furnitures.sofa.name).visible = this.furnitures.sofa.state.visibility;
        furnituresFolder.add( {"Sofa" : this.furnitures.sofa.state.visibility} , "Sofa").onChange( value => {
            this.#getObjectByName(this.furnitures.sofa.name).visible = value;
        });
        //For Table
        let tableData = {
            "Table" : this.furnitures.table.state.visibility,
            "Table Size" : 2,
            "Table Rotation" : 0,
            "Raise up table" : () => app.emitEvent('mouseDown', 'btn_up'),
            "Drop table" : () => app.emitEvent('mouseDown', 'btn_Down'),
            "Table Model": 1,
            "Table Color": 2,
            "Cup Holder": 0,
            "Cable Tray": this.furnitures.table.state.cableManagement1,
            "Headset Holder": this.furnitures.table.state.headsetHolder1,

            "Headset": this.furnitures.table.state.headset1,
            "Mouse": this.furnitures.table.state.mouse1,
            "Mouse Pad": this.furnitures.table.state.mousepad1,
            "Mug": this.furnitures.table.state.mug1,
            "Keyboard": this.furnitures.table.state.keyboard1,
            "Monitor": this.furnitures.table.state.monitor1
        }
        //Initializing
        this.#getObjectByName(this.furnitures.table.name).visible = this.furnitures.table.state.visibility;
        //=> table top
        this.#getObjectByName("Outline Carbon").visible = this.furnitures.table.state.outlineCarbon;
        this.#getObjectByName("Outline").visible = this.furnitures.table.state.outline;
        this.#getObjectByName("Void").visible = this.furnitures.table.state.void;
        this.#getObjectByName("Sola").visible = this.furnitures.table.state.sola;
        //=> cup holder
        this.#getObjectByName("Cupholder1").visible = this.furnitures.table.state.cupHolder1;
        this.#getObjectByName("Cupholder2").visible = this.furnitures.table.state.cupHolder2;
        this.#getObjectByName("Cupholder3").visible = this.furnitures.table.state.cupHolder3;
        this.#getObjectByName("Cupholder4").visible = this.furnitures.table.state.cupHolder4;
        //=> cable try
        this.#getObjectByName("Cable_Tray_LP").visible = this.furnitures.table.state.cableManagement1;
        //=> headset holder
        this.#getObjectByName("Headset_Holder").visible = this.furnitures.table.state.headsetHolder1;
        //=> headset 
        this.#getObjectByName("Headset").visible = this.furnitures.table.state.headset1;
        //=> mouse pad
        this.#getObjectByName("MusePad1").visible = this.furnitures.table.state.mousepad1;
        //=> mug
        this.#getObjectByName("Mug").visible = this.furnitures.table.state.mug1;
        //=> keyboard
        this.#getObjectByName("Keyboard").visible = this.furnitures.table.state.keyboard1;
        //=> mouse
        this.#getObjectByName("Mouse").visible = this.furnitures.table.state.mouse1;
        //=> monitor
        this.#getObjectByName("Monitor_UltraW").visible = this.furnitures.table.state.monitor1;

        // let TB_zMin = -((this.floor.width - this.furnitures.table.width)/2 - this.walls.thickness);
        // let TB_zMax = ((this.floor.width - this.furnitures.table.width)/2 - this.walls.thickness);
        // let TB_yMin = 0.5;
        // let TB_yMax = 0.6; 
        // let TB_xMin = -((this.floor.length - this.furnitures.table.length)/2 - this.walls.thickness);
        // let TB_xMax = ((this.floor.length - this.furnitures.table.length)/2 - this.walls.thickness);
        // this.#setDragDropLimits(this.furnitures.table.name,"DragDrop","limits",TB_xMin , TB_xMax , TB_yMin , TB_yMax , TB_zMin , TB_zMax);
        furnituresFolder.add( tableData , "Table").onChange( value => {
            this.#getObjectByName("Outline Carbon").visible = this.furnitures.table.state.outlineCarbon;
            this.#getObjectByName("Outline").visible = this.furnitures.table.state.outline;
            this.#getObjectByName("Void").visible = this.furnitures.table.state.void;
            this.#getObjectByName("Sola").visible = this.furnitures.table.state.sola;
            this.#getObjectByName(this.furnitures.table.name).visible = value;
        });
        furnituresFolder.add( tableData , "Table Size", this.furnitures.table.size).onChange( value => {
            switch (value) {
                case 1:
                    app.emitEvent('mouseDown', 'btn_Cube140');
                    break;
                case 2:
                    app.emitEvent('mouseDown', 'btn_Cube160');
                    break;
                case 3:
                    app.emitEvent('mouseDown', 'btn_Cube180');
                    break;              
                default:
                    app.emitEvent('mouseDown', 'btn_Cube160');
                    break;
            }
        });
        furnituresFolder.add( tableData , "Table Rotation", -3.14,3.14,0.01).onChange( value => {
            this.#getObjectByName(this.furnitures.table.name).rotation.y = value;
        });
        furnituresFolder.add( tableData , "Raise up table");
        furnituresFolder.add( tableData , "Drop table");

        furnituresFolder.add( tableData , "Table Model", this.furnitures.table.type).onChange( value => {
            switch (value) {
                case 1:
                    this.#getObjectByName("Outline Carbon").visible = true;
                    this.#getObjectByName("Outline").visible = false;
                    this.#getObjectByName("Void").visible = false;
                    this.#getObjectByName("Sola").visible = false;
                    this.furnitures.table.state.outlineCarbon = true;
                    this.furnitures.table.state.outline = false;
                    this.furnitures.table.state.void = false;
                    this.furnitures.table.state.sola = false;
                    break;
                case 2:
                    this.#getObjectByName("Outline Carbon").visible = false;
                    this.#getObjectByName("Outline").visible = true;
                    this.#getObjectByName("Void").visible = false;
                    this.#getObjectByName("Sola").visible = false;
                    this.furnitures.table.state.outlineCarbon = false;
                    this.furnitures.table.state.outline = true;
                    this.furnitures.table.state.void = false;
                    this.furnitures.table.state.sola = false;
                    break;
                case 3:
                    this.#getObjectByName("Outline Carbon").visible = false;
                    this.#getObjectByName("Outline").visible = false;
                    this.#getObjectByName("Void").visible = true;
                    this.#getObjectByName("Sola").visible = false;
                    this.furnitures.table.state.outlineCarbon = false;
                    this.furnitures.table.state.outline = false;
                    this.furnitures.table.state.void = true;
                    this.furnitures.table.state.sola = false;
                    break;   
                case 4:
                    this.#getObjectByName("Outline Carbon").visible = false;
                    this.#getObjectByName("Outline").visible = false;
                    this.#getObjectByName("Void").visible = false;
                    this.#getObjectByName("Sola").visible = true;
                    this.furnitures.table.state.outlineCarbon = false;
                    this.furnitures.table.state.outline = false;
                    this.furnitures.table.state.void = false;
                    this.furnitures.table.state.sola = true;
                    break;            
                default:
                    this.#getObjectByName("Outline Carbon").visible = true;
                    this.#getObjectByName("Outline").visible = false;
                    this.#getObjectByName("Void").visible = false;
                    this.#getObjectByName("Sola").visible = false;
                    this.furnitures.table.state.outlineCarbon = true;
                    this.furnitures.table.state.outline = false;
                    this.furnitures.table.state.void = false;
                    this.furnitures.table.state.sola = false;
                    break;
            }
        });
        furnituresFolder.add( tableData , "Table Color", this.furnitures.table.color).onChange( value => {
            switch (value) {
                case 1:
                    app.emitEvent('mouseDown', 'btn_ColorW');
                    break;
                case 2:
                    app.emitEvent('mouseDown', 'btn_ColorB');
                    break;             
                default:
                    app.emitEvent('mouseDown', 'btn_ColorB');
                    break;
            }
        });
        furnituresFolder.add( tableData , "Cable Tray").onChange( value => {
            this.#getObjectByName("Cable_Tray_LP").visible = value;
        });
        furnituresFolder.add( tableData , "Cup Holder", this.furnitures.table.addon.cupHolder).onChange( value => {
            console.log(value);
            switch (value) {
                case 0:
                    this.#getObjectByName("Cupholder1").visible = false;
                    this.#getObjectByName("Cupholder2").visible = false;
                    this.#getObjectByName("Cupholder3").visible = false;
                    this.#getObjectByName("Cupholder4").visible = false;
                    this.furnitures.table.state.cupHolder1 = false;
                    this.furnitures.table.state.cupHolder2 = false;
                    this.furnitures.table.state.cupHolder3 = false;
                    this.furnitures.table.state.cupHolder4 = false;
                    break;
                case 1:
                    this.#getObjectByName("Cupholder1").visible = true;
                    this.#getObjectByName("Cupholder2").visible = false;
                    this.#getObjectByName("Cupholder3").visible = false;
                    this.#getObjectByName("Cupholder4").visible = false;
                    this.furnitures.table.state.cupHolder1 = true;
                    this.furnitures.table.state.cupHolder2 = false;
                    this.furnitures.table.state.cupHolder3 = false;
                    this.furnitures.table.state.cupHolder4 = false;
                    break;
                case 2:
                    this.#getObjectByName("Cupholder1").visible = false;
                    this.#getObjectByName("Cupholder2").visible = true;
                    this.#getObjectByName("Cupholder3").visible = false;
                    this.#getObjectByName("Cupholder4").visible = false;
                    this.furnitures.table.state.cupHolder1 = false;
                    this.furnitures.table.state.cupHolder2 = true;
                    this.furnitures.table.state.cupHolder3 = false;
                    this.furnitures.table.state.cupHolder4 = false;
                    break;
                case 3:
                    this.#getObjectByName("Cupholder1").visible = false;
                    this.#getObjectByName("Cupholder2").visible = false;
                    this.#getObjectByName("Cupholder3").visible = true;
                    this.#getObjectByName("Cupholder4").visible = false;
                    this.furnitures.table.state.cupHolder1 = false;
                    this.furnitures.table.state.cupHolder2 = false;
                    this.furnitures.table.state.cupHolder3 = true;
                    this.furnitures.table.state.cupHolder4 = false;
                    break;   
                case 4:
                    this.#getObjectByName("Cupholder1").visible = false;
                    this.#getObjectByName("Cupholder2").visible = false;
                    this.#getObjectByName("Cupholder3").visible = false;
                    this.#getObjectByName("Cupholder4").visible = true;
                    this.furnitures.table.state.cupHolder1 = false;
                    this.furnitures.table.state.cupHolder2 = false;
                    this.furnitures.table.state.cupHolder3 = false;
                    this.furnitures.table.state.cupHolder4 = true;
                    break;            
                default:
                    this.#getObjectByName("Cupholder1").visible = true;
                    this.#getObjectByName("Cupholder2").visible = false;
                    this.#getObjectByName("Cupholder3").visible = false;
                    this.#getObjectByName("Cupholder4").visible = false;
                    this.furnitures.table.state.cupHolder1 = true;
                    this.furnitures.table.state.cupHolder2 = false;
                    this.furnitures.table.state.cupHolder3 = false;
                    this.furnitures.table.state.cupHolder4 = false;
                    break;
            }
        });
        furnituresFolder.add( tableData , "Headset Holder").onChange( value => {
            this.#getObjectByName("Headset_Holder").visible = value;
        });
        furnituresFolder.add( tableData , "Headset").onChange( value => {
            this.#getObjectByName("Headset").visible = value;
        });
        furnituresFolder.add( tableData , "Mouse").onChange( value => {
            this.#getObjectByName("Mouse").visible = value;
        });
        furnituresFolder.add( tableData , "Mouse Pad").onChange( value => {
            this.#getObjectByName("MusePad1").visible = value;
        });
        furnituresFolder.add( tableData , "Mug").onChange( value => {
            this.#getObjectByName("Mug").visible = value;
        });
        furnituresFolder.add( tableData , "Keyboard").onChange( value => {
            this.#getObjectByName("Keyboard").visible = value;
        });
        furnituresFolder.add( tableData , "Monitor").onChange( value => {
            this.#getObjectByName("Monitor_UltraW").visible = value;
        });
        // console.log(app.findObjectByName("Window"))
        
        this.show(); 
        
        /*Detect Dragable object*/
        let dragData = {};
        let exclude = [this.windows.rightWindow.name,this.windows.frontWindow.name,this.windows.leftWindow.name,this.windows.backWindow.name]
        this.#calculateOBjectDimension("Table Black");
        if(app){
            app.canvas.addEventListener("pointerdown",() => {
                dragData = {}
                if(_.has(app._eventManager.handlers["DragDrop"],"activeEvent") && app._eventManager.handlers.DragDrop.activeEvent != null){
                    
                    dragData.dragObjectName =  app._eventManager.handlers.DragDrop.activeEvent.object.name;
                    dragData.dragObjectDimension = this.#calculateOBjectDimension(dragData.dragObjectName);
                    if(!_.contains(exclude,dragData.dragObjectName)){
                        this.#setDragDropLimits(dragData.dragObjectName,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness - dragData.dragObjectDimension.x/2),(this.floor.length/2 - this.walls.thickness -  dragData.dragObjectDimension.x/2),(dragData.dragObjectDimension.y/2),(dragData.dragObjectDimension.y/2 + 0.1),-(this.floor.width/2 - this.walls.thickness -  dragData.dragObjectDimension.z/2),(this.floor.width/2 - this.walls.thickness - dragData.dragObjectDimension.z/2));
                    }
                   
                    // dragData.dragObjectDimension = this.#calculateOBjectDimension(dragData.dragObjectName);
                    // console.log(dragData);
                } 
                
            });
            app.canvas.addEventListener("pointermove",() => {
                if(_.has(dragData,"dragObjectName") && dragData.dragObjectName != null && !_.contains(exclude,dragData.dragObjectName)){
                    // console.log(this.#getObjectByName(dragData.dragObject).position.z); 
                    // if(this.#getObjectByName(dragData.dragObject).position.z > 131){
                    //     this.#getObjectByName(dragData.dragObject).position.z = 131
                    // }
                    if(_.has(app._eventManager.handlers["DragDrop"],"lastDropDestination") && app._eventManager.handlers.DragDrop.lastDropDestination != null /*&& dragData.dragTarget != app._eventManager.handlers.DragDrop.lastDropDestination.name*/ ){
                        dragData.dragObjectDimension = this.#calculateOBjectDimension(dragData.dragObjectName);

                        this.#setDragDropLimits(dragData.dragObjectName,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness - dragData.dragObjectDimension.x/2),(this.floor.length/2 - this.walls.thickness -  dragData.dragObjectDimension.x/2),(dragData.dragObjectDimension.y/2),(dragData.dragObjectDimension.y/2 + 0.1),-(this.floor.width/2 - this.walls.thickness -  dragData.dragObjectDimension.z/2),(this.floor.width/2 - this.walls.thickness - dragData.dragObjectDimension.z/2));
                        
                        if (this.#getObjectByName(dragData.dragObjectName).position.z < -((this.floor.width - dragData.dragObjectDimension.z)/2 - this.walls.thickness)){
                            this.#getObjectByName(dragData.dragObjectName).position.z = -((this.floor.width - dragData.dragObjectDimension.z)/2 - this.walls.thickness);
                        }
                        if (this.#getObjectByName(dragData.dragObjectName).position.z > ((this.floor.width - dragData.dragObjectDimension.z)/2 - this.walls.thickness)){
                            this.#getObjectByName(dragData.dragObjectName).position.z = ((this.floor.width - dragData.dragObjectDimension.z)/2 - this.walls.thickness);
                        }

                        if (this.#getObjectByName(dragData.dragObjectName).position.x < -((this.floor.length - dragData.dragObjectDimension.x)/2 - this.walls.thickness)){
                            this.#getObjectByName(dragData.dragObjectName).position.x = -((this.floor.length - dragData.dragObjectDimension.x)/2 - this.walls.thickness);
                        }
                        if (this.#getObjectByName(dragData.dragObjectName).position.x > ((this.floor.length - dragData.dragObjectDimension.x)/2 - this.walls.thickness)){
                            this.#getObjectByName(dragData.dragObjectName).position.x = ((this.floor.length - dragData.dragObjectDimension.x)/2 - this.walls.thickness);
                        }


                        dragData.dragTarget =  app._eventManager.handlers.DragDrop.lastDropDestination.name;
                        console.log(dragData)   
                    }
                }
                
            });
            app.canvas.addEventListener("pointerup",() => {
                dragData = {};
            });
        }

        // this.controllers = this.controllersRecursive();
        // console.log(this.controllersRecursive());
    }

    #updateWalls(parameter,value){

        let windowExtrudeWidth = this._splineApp.getVariable("windowExtrudeWidth");
        let windowExtrudeDepth = this._splineApp.getVariable("windowExtrudeDepth");
        /*the followinf value should be multiply with scale, because WWR is
        a group or component object and Spline couldn't handle size automaticaly
        so we change scale eachtime in update function. thus we multiply
        width with  scale each time!*/
        let windowFrameWidthWWR = this._splineApp.getVariable("windowFrameWidth_WWR");
        let windowFrameHeightWWR = this._splineApp.getVariable("windowFrameHeight_WWR");
        let windowFrameWidthWWL = this._splineApp.getVariable("windowFrameWidth_WWL");
        let windowFrameHeightWWL = this._splineApp.getVariable("windowFrameHeight_WWL");
        /*since we use rotate.y= 90 to make window for back and front
        walls, yet we should scale x, since scale function in spline opperate
        over main position! */
        let windowFrameWidthWWB = this._splineApp.getVariable("windowFrameWidth_WWB");
        let windowFrameHeightWWB = this._splineApp.getVariable("windowFrameHeight_WWB");
        let windowFrameWidthWWF = this._splineApp.getVariable("windowFrameWidth_WWF");
        let windowFrameHeightWWF = this._splineApp.getVariable("windowFrameHeight_WWF");

        let limits_WWR =  this.getEventData(this.windows.rightWindow.name,"DragDrop","limits");
        let limits_WWB =  this.getEventData(this.windows.backWindow.name,"DragDrop","limits");
        let limits_WWL =  this.getEventData(this.windows.leftWindow.name,"DragDrop","limits");
        let limits_WWF =  this.getEventData(this.windows.frontWindow.name,"DragDrop","limits");

        let limits_DWB =  this.getEventData(this.doors.backDoor,"DragDrop","limits");
        let limits_Radiator =  this.getEventData(this.furnitures.radiator.name,"DragDrop","limits");
        let limits_Table =  this.getEventData(this.furnitures.table.name,"DragDrop","limits");
        // this._splineApp._resize();
        // console.log(limits_DWB);
        switch (parameter) {
            case "floorWidth":
                this.floor.width = value;
                this.#findControllers("windowFrameWidth_WWB").max(this.floor.width - 2 * this.walls.thickness - 2 * this.windowFixedToSide );
                this.#findControllers("windowFrameWidth_WWB").updateDisplay();
                this.#findControllers("windowFrameWidth_WWF").max(this.floor.width - 2 * this.walls.thickness - 2 * this.windowFixedToSide );
                this.#findControllers("windowFrameWidth_WWF").updateDisplay();
                //Walls
                this._splineApp.setVariable("wallLeftPosition_Z",value/2 - this.walls.thickness/2);
                this._splineApp.setVariable("wallRightPosition_Z",-(value/2 - this.walls.thickness/2));
                //Windows
                /*On Right Wall*/
                this.#getObjectByName(this.windows.rightWindow.name).position.z = -(value/2 - this.walls.thickness- windowExtrudeDepth/2);
                /*On Back Wall*/
                this.#setDragDropLimits(this.windows.backWindow.name,"DragDrop","limits",-Infinity,Infinity,limits_WWB[2],limits_WWB[3],-(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWB_releativeZ_Pos = this._splineApp.findObjectByName(this.windows.backWindow.name).position.z > (value/2 - windowFrameWidthWWB/2 - this.windowFixedToSide);
                if(WWB_releativeZ_Pos){
                    this.#getObjectByName(this.windows.backWindow.name).position.z = (value/2 - windowFrameWidthWWB/2 - this.windowFixedToSide);
                }
                let WWB_releativeZ_Neg = this.#getObjectByName(this.windows.backWindow.name).position.z < -(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWB_releativeZ_Neg){
                    this.#getObjectByName(this.windows.backWindow.name).position.z = -(value/2 - windowFrameWidthWWB/2 - this.walls.thickness - this.windowFixedToSide);
                }
                /*On Left Wall*/
                this.#getObjectByName(this.windows.leftWindow.name).position.z = (value/2 - this.walls.thickness- windowExtrudeDepth/2);
                /*On Front Wall*/
                this.#setDragDropLimits(this.windows.frontWindow.name,"DragDrop","limits",-Infinity,Infinity,limits_WWF[2],limits_WWF[3],-(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWF_releativeZ_Pos = this._splineApp.findObjectByName(this.windows.frontWindow.name).position.z > (value/2 - windowFrameWidthWWF/2 - this.windowFixedToSide);
                if(WWF_releativeZ_Pos){
                    this.#getObjectByName(this.windows.frontWindow.name).position.z = (value/2 - windowFrameWidthWWF/2 - this.windowFixedToSide);
                }
                let WWF_releativeZ_Neg = this.#getObjectByName(this.windows.frontWindow.name).position.z < -(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWF_releativeZ_Neg){
                    this.#getObjectByName(this.windows.frontWindow.name).position.z = -(value/2 - windowFrameWidthWWF/2 - this.walls.thickness - this.windowFixedToSide);
                }
                //Cornice
                this.#getObjectByName(this.cornice.rightCornice).position.z = -(value/2 - this.walls.thickness - this.cornice.thickness/2);
                this.#getObjectByName(this.cornice.leftCornice).position.z = (value/2 - this.walls.thickness - this.cornice.thickness/2)
                this._splineApp.setVariable("corniceLengthFB",value - 0.5);

                //Door
                this.#setDragDropLimits(this.doors.backDoor,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness),(this.floor.length/2 - this.walls.thickness),limits_DWB[2],limits_DWB[3],-(value/2 - this.walls.thickness),(value/2 - this.walls.thickness));
                //Radiator
                this.#setDragDropLimits(this.furnitures.radiator.name,"DragDrop","limits",-(this.floor.length/2 - this.walls.thickness),(this.floor.length/2 - this.walls.thickness),limits_Radiator[2],limits_Radiator[3],-(value/2 - this.walls.thickness),(value/2 - this.walls.thickness));
                //Table
                this.#setDragDropLimits(this.furnitures.table.name,"DragDrop","limits",-((this.floor.length - this.furnitures.table.length)/2 - this.walls.thickness) , ((this.floor.length - this.furnitures.table.length)/2 - this.walls.thickness) , limits_Table[2] , limits_Table[3] , -((value - this.furnitures.table.width)/2 - this.walls.thickness) , ((value - this.furnitures.table.width)/2 - this.walls.thickness));
                break;
            case "floorLength":
                this.floor.length = value;
                this.#findControllers("windowFrameWidth_WWR").max(this.floor.length - 2 * this.walls.thickness - 2 * this.windowFixedToSide );
                this.#findControllers("windowFrameWidth_WWR").updateDisplay();
                this.#findControllers("windowFrameWidth_WWL").max(this.floor.length - 2 * this.walls.thickness - 2 * this.windowFixedToSide );
                this.#findControllers("windowFrameWidth_WWL").updateDisplay();
                //Walls
                this._splineApp.setVariable("wallFrontPosition_X",value/2 - this.walls.thickness/2);
                this._splineApp.setVariable("wallBackPosition_X",-(value/2 - this.walls.thickness/2));
                //Windows
                /*On Right Wall*/
                this.#setDragDropLimits(this.windows.rightWindow.name,"DragDrop","limits",-(value/2 - windowFrameWidthWWR/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWR/2 - this.windowFixedToSide),limits_WWR[2],limits_WWR[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWR_releativeX_Pos = this._splineApp.findObjectByName(this.windows.rightWindow.name).position.x > (value/2 - windowFrameWidthWWR/2 - this.windowFixedToSide);
                if(WWR_releativeX_Pos){
                    this.#getObjectByName(this.windows.rightWindow.name).position.x = (value/2 - windowFrameWidthWWR/2 - this.windowFixedToSide);
                }
                let WWR_releativeX_Neg = this.#getObjectByName(this.windows.rightWindow.name).position.x < -(value/2 - windowFrameWidthWWR/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWR_releativeX_Neg){
                    this.#getObjectByName(this.windows.rightWindow.name).position.x = -(value/2 - windowFrameWidthWWR/2 - this.walls.thickness - this.windowFixedToSide);
                }
                /*On Back Wall*/
                this.#getObjectByName(this.windows.backWindow.name).position.x = -(value/2 - this.walls.thickness- windowExtrudeDepth/2);
                /*On Left Wall*/
                this.#setDragDropLimits(this.windows.leftWindow.name,"DragDrop","limits",-(value/2 - windowFrameWidthWWL/2 - this.walls.thickness - this.windowFixedToSide),(value/2 - windowFrameWidthWWL/2 - this.windowFixedToSide),limits_WWL[2],limits_WWL[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length of wall*/
                let WWL_releativeX_Pos = this._splineApp.findObjectByName(this.windows.leftWindow.name).position.x > (value/2 - windowFrameWidthWWL/2 - this.windowFixedToSide);
                if(WWL_releativeX_Pos){
                    this.#getObjectByName(this.windows.leftWindow.name).position.x = (value/2 - windowFrameWidthWWL/2 - this.windowFixedToSide);
                }
                let WWL_releativeX_Neg = this.#getObjectByName(this.windows.leftWindow.name).position.x < -(value/2 - windowFrameWidthWWL/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWL_releativeX_Neg){
                    this.#getObjectByName(this.windows.leftWindow.name).position.x = -(value/2 - windowFrameWidthWWL/2 - this.walls.thickness - this.windowFixedToSide);
                }
                /*On Front Wall*/
                this.#getObjectByName(this.windows.frontWindow.name).position.x = (value/2 - this.walls.thickness- windowExtrudeDepth/2);
                //Cornice
                this.#getObjectByName(this.cornice.frontCornice).position.x = (value/2 - this.walls.thickness - this.cornice.thickness/2);
                this.#getObjectByName(this.cornice.backCornice).position.x = -(value/2 - this.walls.thickness - this.cornice.thickness/2)
                this._splineApp.setVariable("corniceLengthRL",value - 0.5);
                //Door
                this.#setDragDropLimits(this.doors.backDoor,"DragDrop","limits",-(value/2 - this.walls.thickness),(value/2 - this.walls.thickness),limits_DWB[2],limits_DWB[3],-(this.floor.width/2 - this.walls.thickness),(this.floor.width/2 - this.walls.thickness));
                //Radiator
                this.#setDragDropLimits(this.furnitures.radiator.name,"DragDrop","limits",-(value/2 - this.walls.thickness),(value/2 - this.walls.thickness),limits_Radiator[2],limits_Radiator[3],-(this.floor.width/2 - this.walls.thickness),(this.floor.width/2 - this.walls.thickness));
                //Table
                this.#setDragDropLimits(this.furnitures.table.name,"DragDrop","limits",-((value - this.furnitures.table.length)/2 - this.walls.thickness) , ((value - this.furnitures.table.length)/2 - this.walls.thickness) , limits_Table[2] , limits_Table[3] , -((this.floor.width - this.furnitures.table.width)/2 - this.walls.thickness), ((this.floor.width - this.furnitures.table.width)/2 - this.walls.thickness));
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
                this.#setDragDropLimits(this.windows.rightWindow.name,"DragDrop","limits",limits_WWR[0],limits_WWR[1],(windowFrameHeightWWR/2 + this.windowFixedToFloor),(value - windowFrameHeightWWR/2 - this.windowFixedToCeil),-Infinity,Infinity);
                let WWR_releativeY_Pos = this.#getObjectByName(this.windows.rightWindow.name).position.y > (value - windowFrameHeightWWR/2 - this.windowFixedToCeil)
                if(WWR_releativeY_Pos){
                    this.#getObjectByName(this.windows.rightWindow.name).position.y = (value - windowFrameHeightWWR/2 - this.windowFixedToCeil);
                }
                let WWR_releativeY_Neg = this.#getObjectByName(this.windows.rightWindow.name).position.y < (windowFrameHeightWWR/2 + this.windowFixedToFloor)
                if(WWR_releativeY_Neg){
                    this.#getObjectByName(this.windows.rightWindow.name).position.y = (windowFrameHeightWWR/2 + this.windowFixedToFloor);
                }
                /*On Back Wall*/
                this.#setDragDropLimits(this.windows.backWindow.name,"DragDrop","limits",-Infinity,Infinity,(windowFrameHeightWWB/2 + this.windowFixedToFloor),(value - windowFrameHeightWWB/2 - this.windowFixedToCeil),limits_WWB[4],limits_WWB[5]);
                let WWB_releativeY_Pos = this.#getObjectByName(this.windows.backWindow.name).position.y > (value - windowFrameHeightWWB/2 - this.windowFixedToCeil)
                if(WWB_releativeY_Pos){
                    this.#getObjectByName(this.windows.backWindow.name).position.y = (value - windowFrameHeightWWB/2 - this.windowFixedToCeil);
                }
                let WWB_releativeY_Neg = this.#getObjectByName(this.windows.backWindow.name).position.y < (windowFrameHeightWWB/2 + this.windowFixedToFloor)
                if(WWB_releativeY_Neg){
                    this.#getObjectByName(this.windows.backWindow.name).position.y = (windowFrameHeightWWB/2 + this.windowFixedToFloor);
                }
                /*On Left Wall*/
                this.#setDragDropLimits(this.windows.leftWindow.name,"DragDrop","limits",limits_WWL[0],limits_WWL[1],(windowFrameHeightWWL/2 + this.windowFixedToFloor),(value - windowFrameHeightWWL/2 - this.windowFixedToCeil),-Infinity,Infinity);
                let WWL_releativeY_Pos = this.#getObjectByName(this.windows.leftWindow.name).position.y > (value - windowFrameHeightWWL/2 - this.windowFixedToCeil)
                if(WWL_releativeY_Pos){
                    this.#getObjectByName(this.windows.leftWindow.name).position.y = (value - windowFrameHeightWWL/2 - this.windowFixedToCeil);
                }
                let WWL_releativeY_Neg = this.#getObjectByName(this.windows.leftWindow.name).position.y < (windowFrameHeightWWL/2 + this.windowFixedToFloor)
                if(WWL_releativeY_Neg){
                    this.#getObjectByName(this.windows.leftWindow.name).position.y = (windowFrameHeightWWL/2 + this.windowFixedToFloor);
                }
                /*On Back Wall*/
                this.#setDragDropLimits(this.windows.frontWindow.name,"DragDrop","limits",-Infinity,Infinity,(windowFrameHeightWWF/2 + this.windowFixedToFloor),(value - windowFrameHeightWWF/2 - this.windowFixedToCeil),limits_WWF[4],limits_WWF[5]);
                let WWF_releativeY_Pos = this.#getObjectByName(this.windows.frontWindow.name).position.y > (value - windowFrameHeightWWF/2 - this.windowFixedToCeil)
                if(WWF_releativeY_Pos){
                    this.#getObjectByName(this.windows.frontWindow.name).position.y = (value - windowFrameHeightWWF/2 - this.windowFixedToCeil);
                }
                let WWF_releativeY_Neg = this.#getObjectByName(this.windows.frontWindow.name).position.y < (windowFrameHeightWWF/2 + this.windowFixedToFloor)
                if(WWF_releativeY_Neg){
                    this.#getObjectByName(this.windows.frontWindow.name).position.y = (windowFrameHeightWWF/2 + this.windowFixedToFloor);
                }
                // //Counters
                // this.#getObjectByName("Counters").position.y = value + 60;
                break; 
            default:
                break;
        }
    }

    #updateWindows(parameter,value){

        let windowExtrudeWidth = this._splineApp.getVariable("windowExtrudeWidth");

        let limits_WWR =  this.getEventData(this.windows.rightWindow.name,"DragDrop","limits");
        let limits_WWB =  this.getEventData(this.windows.backWindow.name,"DragDrop","limits");
        let limits_WWL =  this.getEventData(this.windows.leftWindow.name,"DragDrop","limits");
        let limits_WWF =  this.getEventData(this.windows.frontWindow.name,"DragDrop","limits");

        switch (parameter) {
            /*Right Window*/
            case "windowFrameWidth_WWR":
                /*these update floor width controller*/
                this.floor.minWidth = Math.max(
                    this.#findControllers("windowFrameWidth_WWR").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWL").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    210
                );
                this.#findControllers("floorLength").min(this.floor.minWidth);
                this.#findControllers("floorLength").updateDisplay();

                //handle Panels
                this.#getObjectByName("WWR_LF").position.z = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWR_RF").position.z = -(value - windowExtrudeWidth)/2;
                if(this.#findControllers("Panel Number WR").getValue() == 3){
                    this.#getObjectByName("WWR_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 3;
                    this.#getObjectByName("WWR_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 3;
                }else if (this.#findControllers("Panel Number WR").getValue() == 4){
                    this.#getObjectByName("WWR_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 2;
                    this.#getObjectByName("WWR_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 2;
                }
                this._splineApp.setVariable("windowFrameWidth_WWR", value);
                this.windows.rightWindow.width = value;

                this.#setDragDropLimits(this.windows.rightWindow.name,"DragDrop","limits",-(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.length/2 - value/2 - this.windowFixedToSide),limits_WWR[2],limits_WWR[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWR_releativeX_Pos = this.#getObjectByName(this.windows.rightWindow.name).position.x > (this.floor.length/2 - value/2 - this.windowFixedToSide);
                if(WWR_releativeX_Pos){
                    this.#getObjectByName(this.windows.rightWindow.name).position.x = (this.floor.length/2 - value/2 - this.windowFixedToSide);
                }
                let WWR_releativeX_Neg = this.#getObjectByName(this.windows.rightWindow.name).position.x < -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWR_releativeX_Neg){
                    this.#getObjectByName(this.windows.rightWindow.name).position.x = -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;
            case "windowFrameHeight_WWR":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;

                //handle Panels
                this.#getObjectByName("WWR_TF").position.y = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWR_BF").position.y = -(value - windowExtrudeWidth)/2;
                this._splineApp.setVariable("windowFrameHeight_WWR", value);
                this.windows.rightWindow.hieght = value;

                this.#setDragDropLimits(this.windows.rightWindow.name,"DragDrop","limits",limits_WWR[0],limits_WWR[1],(value/2 + this.windowFixedToFloor),(this.walls.height - value/2 - this.windowFixedToCeil),-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWR_releativeY_Pos = this.#getObjectByName(this.windows.rightWindow.name).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWR_releativeY_Pos){
                    this.#getObjectByName(this.windows.rightWindow.name).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWR_releativeY_Neg = this.#getObjectByName(this.windows.rightWindow.name).position.y < (value/2 + this.windowFixedToFloor);
                if(WWR_releativeY_Neg){
                    this.#getObjectByName(this.windows.rightWindow.name).position.y = (value/2 + this.windowFixedToFloor);
                }
                break; 
            /*Back Window*/   
            case "windowFrameWidth_WWB": 
                /*these update floor length controller*/
                this.floor.minLength = Math.max(
                    this.#findControllers("windowFrameWidth_WWB").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWF").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    210
                );
                this.#findControllers("floorWidth").min(this.floor.minLength);
                this.#findControllers("floorWidth").updateDisplay();

                //handle Panels
                this.#getObjectByName("WWB_LF").position.z = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWB_RF").position.z = -(value - windowExtrudeWidth)/2;
                if(this.#findControllers("Panel Number WB").getValue() == 3){
                    this.#getObjectByName("WWB_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 3;
                    this.#getObjectByName("WWB_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 3;
                }else if (this.#findControllers("Panel Number WB").getValue() == 4){
                    this.#getObjectByName("WWB_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 2;
                    this.#getObjectByName("WWB_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 2;
                }
                this._splineApp.setVariable("windowFrameWidth_WWB", value);
                this.windows.backWindow.width = value;



                this.#setDragDropLimits(this.windows.backWindow.name,"DragDrop","limits",-Infinity,Infinity,limits_WWB[2],limits_WWB[3],-(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.width/2 - value/2 - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWB_releativeZ_Pos = this.#getObjectByName(this.windows.backWindow.name).position.z > (this.floor.width/2 - value/2 - this.windowFixedToSide);
                if(WWB_releativeZ_Pos){
                    this.#getObjectByName(this.windows.backWindow.name).position.z = (this.floor.width/2 - value/2 - this.windowFixedToSide);
                }
                let WWB_releativeZ_Neg = this.#getObjectByName(this.windows.backWindow.name).position.z < -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWB_releativeZ_Neg){
                    this.#getObjectByName(this.windows.backWindow.name).position.z = -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;  
            case "windowFrameHeight_WWB":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;

                //handle Panels
                this.#getObjectByName("WWB_TF").position.y = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWB_BF").position.y = -(value - windowExtrudeWidth)/2;
                this._splineApp.setVariable("windowFrameHeight_WWB", value);
                this.windows.backWindow.hieght = value;
                
                
                this.#setDragDropLimits(this.windows.backWindow.name,"DragDrop","limits",-Infinity,Infinity,(value/2 + this.windowFixedToFloor),(this.walls.min - value/2 - this.windowFixedToCeil),limits_WWB[4],limits_WWB[5]);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWB_releativeY_Pos = this.#getObjectByName(this.windows.backWindow.name).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWB_releativeY_Pos){
                    this.#getObjectByName(this.windows.backWindow.name).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWB_releativeY_Neg = this.#getObjectByName(this.windows.backWindow.name).position.y < (value/2 + this.windowFixedToFloor);
                if(WWB_releativeY_Neg){
                    this.#getObjectByName(this.windows.backWindow.name).position.y = (value/2 + this.windowFixedToFloor);
                }
                break;
            /*Left Window*/  
            case "windowFrameWidth_WWL":
                /*these update floor width controller*/
                this.floor.minWidth = Math.max(
                    this.#findControllers("windowFrameWidth_WWR").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWL").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    210
                );
                this.#findControllers("floorLength").min(this.floor.minWidth);
                this.#findControllers("floorLength").updateDisplay();

                //handle Panels
                this.#getObjectByName("WWL_LF").position.z = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWL_RF").position.z = -(value - windowExtrudeWidth)/2;
                if(this.#findControllers("Panel Number WL").getValue() == 3){
                    this.#getObjectByName("WWL_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 3;
                    this.#getObjectByName("WWL_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 3;
                }else if (this.#findControllers("Panel Number WL").getValue() == 4){
                    this.#getObjectByName("WWL_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 2;
                    this.#getObjectByName("WWL_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 2;
                }
                this._splineApp.setVariable("windowFrameWidth_WWL", value);
                this.windows.leftWindow.width = value;

                this.#setDragDropLimits(this.windows.leftWindow.name,"DragDrop","limits",-(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.length/2 - value/2 - this.windowFixedToSide),limits_WWL[2],limits_WWL[3],-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWL_releativeX_Pos = this.#getObjectByName(this.windows.leftWindow.name).position.x > (this.floor.length/2 - value/2 - this.windowFixedToSide);
                if(WWL_releativeX_Pos){
                    this.#getObjectByName(this.windows.leftWindow.name).position.x = (this.floor.length/2 - value/2 - this.windowFixedToSide);
                }
                let WWL_releativeX_Neg = this.#getObjectByName(this.windows.leftWindow.name).position.x < -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWL_releativeX_Neg){
                    this.#getObjectByName(this.windows.leftWindow.name).position.x = -(this.floor.length/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;
            case "windowFrameHeight_WWL":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;

                //handle Panels
                this.#getObjectByName("WWL_TF").position.y = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWL_BF").position.y = -(value - windowExtrudeWidth)/2;
                this._splineApp.setVariable("windowFrameHeight_WWL", value);
                this.windows.leftWindow.hieght = value;

                this.#setDragDropLimits(this.windows.leftWindow.name,"DragDrop","limits",limits_WWL[0],limits_WWL[1],(value/2 + this.windowFixedToFloor),(this.walls.min - value/2 - this.windowFixedToCeil),-Infinity,Infinity);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWL_releativeY_Pos = this.#getObjectByName(this.windows.leftWindow.name).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWL_releativeY_Pos){
                    this.#getObjectByName(this.windows.leftWindow.name).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWL_releativeY_Neg = this.#getObjectByName(this.windows.leftWindow.name).position.y < (value/2 + this.windowFixedToFloor);
                if(WWL_releativeY_Neg){
                    this.#getObjectByName(this.windows.leftWindow.name).position.y = (value/2 + this.windowFixedToFloor);
                }
                break; 
            /*Front Window*/   
            case "windowFrameWidth_WWF":  
                /*these update floor length controller*/
                this.floor.minLength = Math.max(
                    this.#findControllers("windowFrameWidth_WWB").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,
                    this.#findControllers("windowFrameWidth_WWF").getValue() + 2 * this.windowFixedToSide + 2 * this.walls.thickness + 1,

                    210
                );
                this.#findControllers("floorWidth").min(this.floor.minLength);
                this.#findControllers("floorWidth").updateDisplay();

                //handle Panels
                this.#getObjectByName("WWF_LF").position.z = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWF_RF").position.z = -(value - windowExtrudeWidth)/2;
                if(this.#findControllers("Panel Number WF").getValue() == 3){
                    this.#getObjectByName("WWF_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 3;
                    this.#getObjectByName("WWF_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 3;
                }else if (this.#findControllers("Panel Number WF").getValue() == 4){
                    this.#getObjectByName("WWF_MLF").position.z = (value/2 - this.windows.extrudeWidth/2) / 2;
                    this.#getObjectByName("WWF_MRF").position.z = -(value/2 - this.windows.extrudeWidth/2)/ 2;
                }
                this._splineApp.setVariable("windowFrameWidth_WWF", value);
                this.windows.frontWindow.width = value;

                this.#setDragDropLimits(this.windows.frontWindow.name,"DragDrop","limits",-Infinity,Infinity,limits_WWF[2],limits_WWF[3],-(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide),(this.floor.width/2 - value/2 - this.windowFixedToSide));
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Length wall*/
                let WWF_releativeZ_Pos = this.#getObjectByName(this.windows.frontWindow.name).position.z > (this.floor.width/2 - value/2 - this.windowFixedToSide);
                if(WWF_releativeZ_Pos){
                    this.#getObjectByName(this.windows.frontWindow.name).position.z = (this.floor.width/2 - value/2 - this.windowFixedToSide);
                }
                let WWF_releativeZ_Neg = this.#getObjectByName(this.windows.frontWindow.name).position.z < -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                if(WWF_releativeZ_Neg){
                    this.#getObjectByName(this.windows.frontWindow.name).position.z = -(this.floor.width/2 - value/2 - this.walls.thickness - this.windowFixedToSide);
                }
                break;  
            case "windowFrameHeight_WWF":
                /*these update wall Hieght controller*/
                this.walls.min = Math.max(
                    this.#findControllers("windowFrameHeight_WWR").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWB").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWL").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.#findControllers("windowFrameHeight_WWF").getValue() + this.windowFixedToFloor + this.windowFixedToCeil + 1,
                    this.roomMinHeight
                );
                this.#findControllers("wallsHeight").min(this.walls.min);
                this.#findControllers("wallsHeight").updateDisplay();
                this.windows.hieght = value;

                //handle Panels
                this.#getObjectByName("WWF_TF").position.y = (value - windowExtrudeWidth)/2;
                this.#getObjectByName("WWF_BF").position.y = -(value - windowExtrudeWidth)/2;
                this._splineApp.setVariable("windowFrameHeight_WWF", value);
                this.windows.backWindow.hieght = value;

                this.#setDragDropLimits(this.windows.frontWindow.name,"DragDrop","limits",-Infinity,Infinity,(value/2 + this.windowFixedToFloor),(this.walls.min - value/2 - this.windowFixedToCeil),limits_WWF[4],limits_WWF[5]);
                /*this is an additional limitaion for window position
                in y deirection 'relative' to the Height of wall*/
                let WWF_releativeY_Pos = this.#getObjectByName(this.windows.frontWindow.name).position.y > (this.walls.height - value/2 - this.windowFixedToCeil);
                if(WWF_releativeY_Pos){
                    this.#getObjectByName(this.windows.frontWindow.name).position.y = (this.walls.height - value/2 - this.windowFixedToCeil);
                }
                let WWF_releativeY_Neg = this.#getObjectByName(this.windows.frontWindow.name).position.y < (value/2 + this.windowFixedToFloor);
                if(WWF_releativeY_Neg){
                    this.#getObjectByName(this.windows.frontWindow.name).position.y = (value/2 + this.windowFixedToFloor);
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

    #filterObjectsListByName(objectsList,...keywords){
        let objects =  _.filter(objectsList, m => {
            let includes = [];
            _.each(keywords, keyword => {
                includes.push(m.name.includes(keyword));
            });
            return _.some(includes); 
        });
        if(objects){
            return _.map(objects, m => m.name)
        }else{
            return {};
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

    #setDragDropLimits(objectName,eventName,eventParameter,xMin,xMax,yMin,yMax,zMin,zMax,onFloor = false){
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
                        eventData.limits[2] = onFloor ? 0 : yMin;
                        eventData.limits[3] = onFloor ? 0.1 : yMax;
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

    #calculateOBjectDimension(name){
        let objects = this._splineApp._scene.children[0].children;
        let target = _.filter(objects, m => m.name == name);
        let max = target[0].recursiveBBox.max;
        let min = target[0].recursiveBBox.min;
        let tetha =  target[0].rotation.y;
        let alpha =  Math.atan(((max.z - min.z) * target[0].scale.z) / ((max.x - min.x) * target[0].scale.x));
        let r = Math.sqrt(Math.pow((max.x - min.x) * target[0].scale.x,2) + Math.pow((max.z - min.z) * target[0].scale.z,2));

        let volumeDimension = {
            x: Math.abs(r * Math.cos(alpha - tetha)),
            y: Math.abs(max.y - min.y),
            z: Math.abs(r * Math.sin(alpha + tetha)),
        }
        // console.log(target[0].recursiveBBox);
        // console.log(volumeDimension);
        return volumeDimension;
    }
}


export {Custom_GUI}