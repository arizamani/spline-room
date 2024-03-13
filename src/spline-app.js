import { Application } from '@splinetool/runtime';

function splineApp(canvas,url){
    let app = new Application(canvas);
    let checkLoadState ;
    let p = new Promise((resolve,reject) => {

        app.load(url).then( () => {
            console.log(app._scene.children[0].children[0].recursiveBBox)
            checkLoadState = true;
        }).catch(e => {
            checkLoadState = false;
            
        }).then(() => {
            if (checkLoadState){
                resolve(app);
            }else{
                reject(new Error("Something Wrong Happen in Loading Proccess."));
            }
        })
    });

    return p;
 }




export {splineApp}
